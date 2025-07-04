const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { detectCredentials } = require('../services/credentialsManager');

const router = express.Router();

// Helper function to render JSX
function renderJSX(component, props = {}) {
  return renderToString(React.createElement(component, props));
}

// Get all available credentials
router.get('/', async (req, res) => {
  try {
    const credentials = await detectCredentials();
    res.json(credentials);
  } catch (error) {
    console.error('Error detecting credentials:', error);
    res.status(500).json({ error: 'Failed to detect credentials' });
  }
});

// Handle credential selection
router.get('/select', (req, res) => {
  const { credentials } = req.query;
  
  if (!credentials) {
    return res.send('');
  }
  
  try {
    const credentialInfo = JSON.parse(credentials);
    
    const html = `
      <div class="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <div>${credentialInfo.description}</div>
        <div class="mt-1">Region: ${credentialInfo.region}</div>
        ${credentialInfo.type === 'profile' ? `<div class="mt-1">Profile: ${credentialInfo.profile}</div>` : ''}
      </div>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error parsing credentials:', error);
    res.send('<div class="text-sm text-red-600">Error parsing credentials</div>');
  }
});

module.exports = router;
