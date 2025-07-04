import express, { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getLogEntries, clearLog, getLogStats, filterLogEntries } from '../services/requestLogger';
import { RequestLogger, EmptyRequestLogger } from '../components/RequestLogger';

const router = express.Router();

// Helper function to render JSX
function renderJSX(component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}): string {
  return renderToString(React.createElement(component, props));
}

interface LogQueryParams {
  limit?: string;
  service?: string;
  success?: string;
  credentialType?: string;
  operation?: string;
}

// Get log entries
router.get('/', (req: Request<{}, {}, {}, LogQueryParams>, res: Response): void => {
  try {
    const { limit, service, success, credentialType, operation } = req.query;
    
    let logEntries;
    if (service || success !== undefined || credentialType || operation) {
      // Apply filters
      const filters: {
        service?: string;
        success?: boolean;
        credentialType?: string;
        operation?: string;
        limit?: number;
      } = {};
      
      if (service) filters.service = service;
      if (success !== undefined) filters.success = success === 'true';
      if (credentialType) filters.credentialType = credentialType;
      if (operation) filters.operation = operation;
      if (limit) filters.limit = parseInt(limit, 10);
      
      logEntries = filterLogEntries(filters);
    } else {
      const limitNum = limit ? parseInt(limit, 10) : 50;
      logEntries = getLogEntries(limitNum);
    }
    
    const stats = getLogStats();
    
    const html = renderJSX(RequestLogger, { 
      logEntries, 
      stats: {
        total: stats.total,
        successful: stats.successful,
        failed: stats.failed
      }
    });
    res.send(html);
  } catch (error) {
    console.error('Error getting log entries:', error);
    res.status(500).send('<div class="p-4 text-red-600">Error loading log entries</div>');
  }
});

// Clear log
router.post('/clear', (req: Request, res: Response): void => {
  try {
    clearLog();
    const html = renderJSX(EmptyRequestLogger, {});
    res.send(html);
  } catch (error) {
    console.error('Error clearing log:', error);
    res.status(500).send('<div class="p-4 text-red-600">Error clearing log</div>');
  }
});

// Get log statistics
router.get('/stats', (req: Request, res: Response): void => {
  try {
    const stats = getLogStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ error: 'Failed to get log statistics' });
  }
});

export default router;
