import express, { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { generateRequestPayload, getFieldMetadata } from '../services/awsServices';
import { ApiRequestForm } from '../components/ApiRequestForm';

const router = express.Router();

// Helper function to render JSX
function renderJSX(component: React.ComponentType<any>, props: any = {}): string {
  return renderToString(React.createElement(component, props));
}

// Get API template for a specific service and operation
router.get('/:service/:operation', (req: Request, res: Response): void => {
  const { service, operation } = req.params;
  
  if (!service || !operation) {
    res.status(400).send(`
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 class="text-red-800 font-medium">Invalid Request</h3>
        <p class="text-red-600 text-sm mt-1">Service and operation parameters are required</p>
      </div>
    `);
    return;
  }
  
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

export default router;
