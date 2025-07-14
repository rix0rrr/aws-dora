import express, { Request, Response, NextFunction, Application } from 'express';

import { AppConfig, CredentialSource } from './types';
import Layout from './components/Layout';
import { ServicesTree, FilterBar } from './components/ServicesTree';
import { EmptyRequestForm } from './components/ApiRequestForm';
import { CredentialsSelector, EmptyCredentialsSelector } from './components/CredentialsSelector';
import { EmptyRequestLogger } from './components/RequestLogger';
import { detectCredentialSources } from './services/credentialsManager';

// Import routes
import makeTreeRouter from './routes/tree';
import apiTemplateRouter from './routes/api-template';
import credentialsRouter from './routes/credentials';
import executeRouter from './routes/execute';
import logsRouter from './routes/logs';
import { renderJSX } from './util/jsx';
import { AwsServiceModelView } from './services/awsServices';

async function startup() {
  const serviceModel = await AwsServiceModelView.fromBuiltinModel();

  const app: Application = express();
  const PORT: number = parseInt(process.env.PORT || '3000', 10);
  const NODE_ENV: string = process.env.NODE_ENV || 'development';

  // Application configuration
  const config: AppConfig = {
    port: PORT,
    // FIXME: Region from AWS config
    defaultRegion: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
    logLevel: (process.env.LOG_LEVEL as AppConfig['logLevel']) || 'info'
  };

  // Performance optimizations
  if (NODE_ENV === 'production') {
    // Enable trust proxy for production
    app.set('trust proxy', 1);

    // Add security headers
    app.use((req: Request, res: Response, next: NextFunction): void => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.static('public', {
    maxAge: NODE_ENV === 'production' ? '1d' : 0
  }));

  // Use routes
  app.use('/tree', makeTreeRouter(serviceModel));
  app.use('/api-template', apiTemplateRouter);
  app.use('/credentials', credentialsRouter);
  app.use('/execute', executeRouter);
  app.use('/logs', logsRouter);

  // Main route
  app.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
      // Detect available credentials
      const credentials: CredentialSource[] = await detectCredentialSources();

      // Render the components
      const filterHtml: string = renderJSX(FilterBar, {});
      const requestFormHtml: string = renderJSX(EmptyRequestForm, {});
      const credentialsHtml: string = credentials.length > 0
        ? renderJSX(CredentialsSelector, { credentials })
        : renderJSX(EmptyCredentialsSelector, {});
      const loggerHtml: string = renderJSX(EmptyRequestLogger, {});

      const html: string = '<!DOCTYPE html>' + renderJSX(Layout, {
        serviceTree: ServicesTree({
          serviceModel,
        }),
        filterContent: filterHtml,
        requestFormContent: requestFormHtml,
        credentialsContent: credentialsHtml,
        loggerContent: loggerHtml
      });
      res.send(html);
    } catch (error) {
      console.error('Error loading page:', error);
      res.status(500).send('Error loading page');
    }
  });

  // Error handling middleware
  app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error('Express error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  const server = app.listen(PORT, (): void => {
    console.log(`AWS API Explorer running on http://localhost:${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', (): void => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close((): void => {
      process.exit(0);
    });
  });

  process.on('SIGINT', (): void => {
    console.log('SIGINT received, shutting down gracefully');
    server.close((): void => {
      process.exit(0);
    });
  });

  // Global error handler
  process.on('uncaughtException', (error: Error): void => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>): void => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

startup().catch((error: Error): void => {
  console.error('Startup error:', error);
  process.exitCode = 1;
});
