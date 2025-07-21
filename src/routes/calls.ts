import express, { Request, Response } from 'express';
import { ApiRequestForm } from '../components/ApiRequestForm';
import { ErrorResponseBox, ResponseBox } from '../components/ResponseBox';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { RequestLog } from '../services/request-log';
import { CredentialSource } from '../types';
import { callSdk } from '../util/call-sdk';
import { renderJSX } from '../util/jsx';

function makeCallRouter(serviceModel: AwsServiceModelView, requestLog: RequestLog) {
  const router = express.Router();

  // Get API template for a specific service and operation
  router.get('/:operationId', (req: Request, res: Response): void => {
    const { operationId } = req.params;

    const op = serviceModel.getOperationById(operationId ?? '');
    if (!op) {
      res.status(400).send(`
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 class="text-red-800 font-medium">Invalid Request</h3>
          <p class="text-red-600 text-sm mt-1">No such operation: ${JSON.stringify(operationId)}</p>
        </div>
      `);
      return;
    }

    const requestTemplate = JSON.stringify(op.operation.requestTemplate ?? {}, undefined, 2);

    // Render the API request form
    const html = renderJSX(ApiRequestForm({
      serviceName: op.service.name,
      operation: op.operation.name,
      operationId: op.operation.operationId,
      requestTemplate,
    }));

    res.send(html);
  });

  // Get API template for a specific service and operation
  router.post('/:operationId', async (req: Request, res: Response) => {
    try {
      const { operationId } = req.params;
      const credentialsStr: string | undefined = req.body.credentials;
      const request: string | undefined = req.body.request;
      const region: string | undefined = req.body.region;
      const op = serviceModel.getOperationById(operationId ?? '');

      if (!credentialsStr) {
        throw new Error('Select a credential source');
      }
      if (!request) {
        throw new Error('No request found');
      }
      if (!op) {
        throw new Error(`No such operation: ${operationId}`);
      }

      const credentials: CredentialSource = JSON.parse(credentialsStr);

      const startTime = new Date();
      const selectedRegion = region === 'credential-default' ? credentials.defaultRegion : region;
      if (!selectedRegion) {
        throw new Error('Select a region');
      }

      const parsedRequest = JSON.parse(request);

      const response = await callSdk(op.service.shortName, op.service.className, op.operation.name, parsedRequest, credentials, selectedRegion);

      const attempts = response.response.$metadata?.attempts ?? 1;
      const requestId = response.response.$metadata?.requestId ?? '';
      const totalRetryDelay = response.response.$metadata?.totalRetryDelay ?? 0;
      delete response.response.$metadata;

      requestLog.add({
        credentials,
        operation: op.operation.name,
        service: op.service.name,
        request: JSON.stringify(parsedRequest, null, 2),
        response: JSON.stringify(response.response, null, 2),
        region: selectedRegion,
        timestamp: startTime,
      });

      res.header('HX-Trigger', 'logUpdated');

      // Render the API request form
      res.send(renderJSX(ResponseBox({
        responseJson: JSON.stringify(response.response, null, 2),
        duration: response.duration || 0,
        attempts,
        requestId,
        totalRetryDelay,
      })));
    } catch (e: any) {
      res.send(renderJSX(ErrorResponseBox({
        errorMessage: e.message,
      })));
    }
  });

  return router;
}


export default makeCallRouter;
