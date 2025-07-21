import express, { Request, Response } from 'express';
import { ServicesTree, ServicesTreeResource, ServicesTreeService } from '../components/ServicesTree';
import { AwsServiceModelView } from '../services/aws-service-model-view';
import { isResource, isService } from '../types/model';
import { renderJSX } from '../util/jsx';

function makeTreeRouter(serviceModel: AwsServiceModelView) {
  const router = express.Router();

  router.post('/toggle/:node', (req: Request, res: Response): void => {
    const { node } = req.params;

    serviceModel.toggleExpanded(node);
    const rh = serviceModel.getNodeById(node, 'filtered');
    if (!rh) {
      res.status(404).send(`Node with ID ${node} not found in AWS service model`);
      return;
    }

    if (isService(rh)) {
      res.send(renderJSX(ServicesTreeService({
        service: rh,
        serviceModel,
      })));
      return;
    }
    if (isResource(rh)) {
      res.send(renderJSX(ServicesTreeResource({
        resource: rh,
        serviceModel,
      })));
      return;
    }
  });

  router.get('/filter', (req: Request, res: Response): void => {
    const search = req.query.search as string || '';
    serviceModel.setFilter(search);
    res.send(renderJSX(ServicesTree({
      serviceModel,
    })));
  });

  router.post('/filter', (req: Request, res: Response): void => {
    const { search } = req.body;

    serviceModel.setFilter(search);
    res.send(renderJSX(ServicesTree({
      serviceModel,
    })));
  });

  return router;
}

export default makeTreeRouter;
