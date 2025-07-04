const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { getLogEntries, clearLog, getLogStats, filterLogEntries } = require('../services/requestLogger');
const { RequestLogger, EmptyRequestLogger } = require('../components/RequestLogger');

const router = express.Router();

// Helper function to render JSX
function renderJSX(component, props = {}) {
  return renderToString(React.createElement(component, props));
}

// Get log entries
router.get('/', (req, res) => {
  try {
    const { limit, service, success, credentialType } = req.query;
    
    let logEntries;
    if (service || success !== undefined || credentialType) {
      // Apply filters
      const filters = {};
      if (service) filters.service = service;
      if (success !== undefined) filters.success = success === 'true';
      if (credentialType) filters.credentialType = credentialType;
      
      logEntries = filterLogEntries(filters);
    } else {
      logEntries = getLogEntries(limit ? parseInt(limit) : 50);
    }
    
    const stats = getLogStats();
    
    const html = renderJSX(RequestLogger, { logEntries, stats });
    res.send(html);
  } catch (error) {
    console.error('Error getting log entries:', error);
    res.status(500).send('<div class="p-4 text-red-600">Error loading log entries</div>');
  }
});

// Clear log
router.post('/clear', (req, res) => {
  try {
    clearLog();
    const html = renderJSX(EmptyRequestLogger);
    res.send(html);
  } catch (error) {
    console.error('Error clearing log:', error);
    res.status(500).send('<div class="p-4 text-red-600">Error clearing log</div>');
  }
});

// Get log statistics
router.get('/stats', (req, res) => {
  try {
    const stats = getLogStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ error: 'Failed to get log statistics' });
  }
});

module.exports = router;
