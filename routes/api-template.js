const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { generateRequestPayload, getFieldMetadata } = require('../services/awsServices');
const { ApiRequestForm } = require('../components/ApiRequestForm');

const router = express.Router();

// Helper function to render JSX
function renderJSX(component, props = {}) {
  return renderToString(React.createElement(component, props));
}

// Get API template for a specific service and operation
router.get('/:service/:operation', (req, res) => {
  const { service, operation } = req.params;
  
  try {
    // Generate the request payload
    const requestPayload = generateRequestPayload(service, operation);
    const fieldMetadata = getFieldMetadata(service, operation);
    
    // Render the API request form
    const html = renderJSX(ApiRequestForm, {
      service,
      operation,
      requestPayload,
      fieldMetadata
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error generating API template:', error);
    res.status(500).send(`
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 class="text-red-800 font-medium">Error Loading Template</h3>
        <p class="text-red-600 text-sm mt-1">Could not generate template for ${service}.${operation}</p>
      </div>
    `);
  }
});

module.exports = router;
