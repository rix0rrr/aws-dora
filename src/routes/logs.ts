import express, { Request, Response } from 'express';
import React from 'react';
import { renderJSX } from '../util/jsx';
import { Log } from '../components/Log';
import { RequestLog } from '../services/request-log';


export default function makeLogsRouter(requestLog: RequestLog) {
  const router = express.Router();

  // Clear log
  router.get('/', (req: Request, res: Response): void => {
    const html = renderJSX(Log({ requestLog }));
    res.send(html);
  });

  // Clear log
  router.post('/clear', (req: Request, res: Response): void => {
    requestLog.clear();
    const html = renderJSX(Log({ requestLog }));
    res.send(html);
  });

  return router;
}