const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { AWS_SERVICES, filterServices } = require('../services/awsServices');

const router = express.Router();

// Helper function to render JSX
function renderJSX(component, props = {}) {
  return renderToString(React.createElement(component, props));
}

// Get operations for a specific service (for tree expansion)
router.get('/:service', (req, res) => {
  const { service } = req.params;
  
  // Find the service in our data structure
  let serviceData = null;
  Object.keys(AWS_SERVICES).forEach(category => {
    if (AWS_SERVICES[category][service]) {
      serviceData = AWS_SERVICES[category][service];
    }
  });
  
  if (!serviceData) {
    return res.status(404).send('Service not found');
  }
  
  // Return HTML for operations
  const operationsHtml = serviceData.operations.map(operation => 
    `<div class="tree-item p-2 text-sm text-gray-600 rounded cursor-pointer hover:bg-blue-50 hover:text-blue-700"
          hx-get="/api-template/${service}/${operation}"
          hx-target="#request-form"
          hx-swap="innerHTML">
      ${operation}
    </div>`
  ).join('');
  
  res.send(operationsHtml);
});

// Filter services based on search term
router.get('/filter', (req, res) => {
  const { search } = req.query;
  const filteredServices = filterServices(search);
  
  const { ServicesTree } = require('../components/ServicesTree');
  const html = renderJSX(ServicesTree, { services: filteredServices });
  
  res.send(html);
});

module.exports = router;
