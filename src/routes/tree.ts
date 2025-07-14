import express, { Request, Response } from 'express';
import { ServicesTree, ServicesTreeResource, ServicesTreeService } from '../components/ServicesTree';
import { AwsServiceModelView } from '../services/awsServices';
import { isResource, isService } from '../types/model';
import { renderJSX } from '../util/jsx';

function makeTreeRouter(serviceModel: AwsServiceModelView) {
  const router = express.Router();

  router.post('/toggle/:node', (req: Request, res: Response): void => {
    const { node } = req.params;

    serviceModel.toggleExpanded(node);
    const rh = serviceModel.getNodeById(node);
    if (isService(rh)) {
      res.send(renderJSX(ServicesTreeService({
        service: rh,
        serviceModel
      })));
      return;
    }
    if (isResource(rh)) {
      res.send(renderJSX(ServicesTreeResource({
        resource: rh,
        serviceModel
      })));
      return;
    }
  });

  return router;
}

export default makeTreeRouter;
