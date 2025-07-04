import express, { Request, Response } from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { detectCredentials } from '../services/credentialsManager';
import { CredentialSource } from '../types';

const router = express.Router();

// Helper function to render JSX
function renderJSX(component: React.ComponentType<Record<string, unknown>>, props: Record<string, unknown> = {}): string {
  return renderToString(React.createElement(component, props));
}

// Get all available credentials
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = await detectCredentials();
    res.json(credentials);
  } catch (error) {
    console.error('Error detecting credentials:', error);
    res.status(500).json({ error: 'Failed to detect credentials' });
  }
});

// Handle credential selection
router.get('/select', (req: Request, res: Response): void => {
  const { credentials } = req.query;
  
  if (!credentials || typeof credentials !== 'string') {
    res.send('');
    return;
  }
  
  try {
    const credentialInfo: CredentialSource = JSON.parse(credentials);
    
    const html = `
      <div class="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <div>Type: ${credentialInfo.type}</div>
        <div class="mt-1">Region: ${credentialInfo.region || 'us-east-1'}</div>
        ${credentialInfo.type === 'profile' && credentialInfo.profile ? 
          `<div class="mt-1">Profile: ${credentialInfo.profile.name}</div>` : ''}
      </div>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    res.send('<div class="text-sm text-red-600">Error parsing credentials</div>');
  }
});

export default router;
