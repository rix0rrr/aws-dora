import express, { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AWS_SERVICES, filterServices } from '../services/awsServices';
import { ServicesTree } from '../components/ServicesTree';

const router = express.Router();

// Helper function to render JSX
function renderJSX(component: React.ComponentType<any>, props: any = {}): string {
  return renderToString(React.createElement(component, props));
}

// Get operations for a specific service (for tree expansion)
router.get('/:service', (req: Request, res: Response): void => {
  const { service } = req.params;
  
  if (!service) {
    res.status(400).send('Service parameter is required');
    return;
  }
  
  // Find the service in our data structure
  let operations: string[] = [];
  Object.keys(AWS_SERVICES).forEach(category => {
    const categoryServices = AWS_SERVICES[category];
    if (categoryServices && categoryServices[service]) {
      operations = categoryServices[service].operations;
    }
  });
  
  if (operations.length === 0) {
    res.status(404).send('Service not found');
    return;
  }
  
  // Return HTML for operations
  const operationsHtml = operations.map((operation: string) => 
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
router.get('/filter', (req: Request, res: Response): void => {
  const { search } = req.query;
  const searchTerm = typeof search === 'string' ? search : '';
  const filteredServices = filterServices(searchTerm);
  
  const html = renderJSX(ServicesTree, { services: filteredServices });
  
  res.send(html);
});

export default router;
