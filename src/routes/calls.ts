import express, { Request, Response } from 'express';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { ApiRequestForm } from '../components/ApiRequestForm';
import { renderJSX } from '../util/jsx';
import { ErrorResponseBox, ResponseBox } from '../components/ResponseBox';

function makeCallRouter(serviceModel: AwsServiceModelView) {
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
  router.post('/:operationId', (req: Request, res: Response): void => {
    try {
      const { operationId } = req.params;
      console.log(req.body);
      const { credentials, request } = req.body;
      const op = serviceModel.getOperationById(operationId ?? '');

      if (!credentials) {
        throw new Error('Select a credential source');
      }
      if (!request) {
        throw new Error('No request found');
      }
      if (!op) {
        throw new Error(`No such operation: ${operationId}`);
      }

      // Render the API request form
      res.send(renderJSX(ResponseBox({
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
