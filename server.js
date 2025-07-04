const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Performance optimizations
if (NODE_ENV === 'production') {
  // Enable trust proxy for production
  app.set('trust proxy', 1);
  
  // Add security headers
  app.use((req, res, next) => {
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

// JSX rendering helper
function renderJSX(component, props = {}) {
  return renderToString(React.createElement(component, props));
}

// Make renderJSX available to routes
app.locals.renderJSX = renderJSX;

// Import components
const Layout = require('./components/Layout.js');
const { ServicesTree, FilterBar } = require('./components/ServicesTree.js');
const { EmptyRequestForm } = require('./components/ApiRequestForm.js');
const { CredentialsSelector, EmptyCredentialsSelector } = require('./components/CredentialsSelector.js');
const { EmptyRequestLogger } = require('./components/RequestLogger.js');
const { AWS_SERVICES } = require('./services/awsServices.js');
const { detectCredentials } = require('./services/credentialsManager.js');

// Import routes
const servicesRouter = require('./routes/services');
const apiTemplateRouter = require('./routes/api-template');
const credentialsRouter = require('./routes/credentials');
const executeRouter = require('./routes/execute');
const logsRouter = require('./routes/logs');

// Use routes
app.use('/services', servicesRouter);
app.use('/api-template', apiTemplateRouter);
app.use('/credentials', credentialsRouter);
app.use('/execute', executeRouter);
app.use('/logs', logsRouter);

// Routes
app.get('/', async (req, res) => {
  try {
    // Detect available credentials
    const credentials = await detectCredentials();
    
    // Render the components
    const treeHtml = renderJSX(ServicesTree, { services: AWS_SERVICES });
    const filterHtml = renderJSX(FilterBar);
    const requestFormHtml = renderJSX(EmptyRequestForm);
    const credentialsHtml = credentials.length > 0 
      ? renderJSX(CredentialsSelector, { credentials })
      : renderJSX(EmptyCredentialsSelector);
    const loggerHtml = renderJSX(EmptyRequestLogger);
    
    const html = '<!DOCTYPE html>' + renderJSX(Layout, {
      treeContent: treeHtml,
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

// Start server
app.listen(PORT, () => {
  console.log(`AWS API Explorer running on http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  if (NODE_ENV === 'development') {
    console.log('Development mode: Auto-reload enabled');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
