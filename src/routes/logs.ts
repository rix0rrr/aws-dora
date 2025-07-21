import express, { Request, Response } from 'express';
import { Log } from '../components/Log';
import { RequestLog } from '../services/request-log';
import { renderJSX } from '../util/jsx';


export default function makeLogsRouter(requestLog: RequestLog) {
  const router = express.Router();

  // Clear log
  router.get('/', (_: Request, res: Response): void => {
    const html = renderJSX(Log({ requestLog }));
    res.send(html);
  });

  // Clear log
  router.post('/clear', (_: Request, res: Response): void => {
    requestLog.clear();
    const html = renderJSX(Log({ requestLog }));
    res.send(html);
  });

  return router;
}