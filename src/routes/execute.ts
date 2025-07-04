import express, { Request, Response } from 'express';
import { executeApiCall, validatePayload, formatResponse } from '../services/apiExecutor';
import { logRequest } from '../services/requestLogger';
import { CredentialSource } from '../types';

const router = express.Router();

interface ExecuteRequestBody {
  service?: string;
  operation?: string;
  credentials?: string;
  'json-editor'?: string;
}

// Execute AWS API call
router.post('/', async (req: Request<{}, {}, ExecuteRequestBody>, res: Response): Promise<void> => {
  try {
    const { service, operation, credentials } = req.body;
    const payloadString = req.body['json-editor'] || '{}';
    
    // Validate inputs
    if (!service || !operation) {
      res.send(generateErrorHtml('Missing service or operation'));
      return;
    }
    
    if (!credentials) {
      res.send(generateErrorHtml('No credentials selected'));
      return;
    }
    
    // Parse credentials
    let credentialInfo: CredentialSource;
    try {
      credentialInfo = JSON.parse(credentials);
    } catch (error) {
      res.send(generateErrorHtml('Invalid credentials format'));
      return;
    }
    
    // Validate JSON payload
    const validation = validatePayload(payloadString);
    if (!validation.valid) {
      res.send(generateErrorHtml(validation.error || 'Invalid payload'));
      return;
    }
    
    if (!validation.payload) {
      res.send(generateErrorHtml('No payload provided'));
      return;
    }
    
    // Execute the API call
    const result = await executeApiCall(service, operation, validation.payload, credentialInfo);
    const formattedResult = formatResponse(result);
    
    // Log the request/response
    logRequest({
      service,
      operation,
      request: {
        service,
        operation,
        payload: validation.payload,
        credentials: credentialInfo,
        region: credentialInfo.region || 'us-east-1'
      },
      response: {
        success: result.success,
        data: result.response,
        error: result.error?.message,
        statusCode: typeof result.error?.code === 'number' ? result.error.code : undefined,
        requestId: result.error?.requestId
      },
      duration: result.duration || 0
    });
    
    // Generate HTML response
    const html = generateResultHtml(formattedResult);
    res.send(html);
    
  } catch (error: any) {
    console.error('Error executing API call:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.send(generateErrorHtml(`Execution error: ${errorMessage}`));
  }
});

interface FormattedResult {
  success: boolean;
  service: string;
  operation: string;
  payload: Record<string, any>;
  response?: string;
  error?: string;
  timestamp: string;
  credentialType: string;
  duration?: number;
}

// Generate HTML for successful/failed API call results
function generateResultHtml(result: FormattedResult): string {
  const timestamp = new Date(result.timestamp).toLocaleString();
  const statusClass = result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const statusIcon = result.success ? '✅' : '❌';
  const statusText = result.success ? 'Success' : 'Error';
  
  return `
    <div class="mb-4 p-4 border rounded-lg ${statusClass}">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center">
          <span class="mr-2">${statusIcon}</span>
          <span class="font-medium">${result.service}.${result.operation}</span>
          <span class="ml-2 text-sm text-gray-600">${statusText}</span>
        </div>
        <div class="text-sm text-gray-500">
          ${timestamp} • ${result.credentialType}
          ${result.duration ? ` • ${result.duration}ms` : ''}
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Request</h4>
          <pre class="text-xs bg-gray-100 p-2 rounded overflow-x-auto"><code class="language-json">${JSON.stringify(result.payload, null, 2)}</code></pre>
        </div>
        
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">${result.success ? 'Response' : 'Error'}</h4>
          <pre class="text-xs bg-gray-100 p-2 rounded overflow-x-auto"><code class="language-json">${result.success ? result.response : result.error}</code></pre>
        </div>
      </div>
    </div>
  `;
}

// Generate HTML for errors
function generateErrorHtml(errorMessage: string): string {
  const timestamp = new Date().toLocaleString();
  
  return `
    <div class="mb-4 p-4 border rounded-lg bg-red-50 border-red-200">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center">
          <span class="mr-2">❌</span>
          <span class="font-medium text-red-800">Execution Error</span>
        </div>
        <div class="text-sm text-gray-500">${timestamp}</div>
      </div>
      
      <div class="text-sm text-red-700">
        ${errorMessage}
      </div>
    </div>
  `;
}

export default router;
