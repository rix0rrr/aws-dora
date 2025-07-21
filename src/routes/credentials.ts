import express, { Request, Response } from 'express';
import { CredentialsCorner } from '../components/CredentialsSelector';
import { CredentialViewModel } from '../services/credentialsManager';
import { CredentialSource } from '../types';
import { renderJSX } from '../util/jsx';

export default function makeCredentialsRouter(credVM: CredentialViewModel) {
  const router = express.Router();

  // Handle credential selection
  router.post('/select-credential', (req: Request, res: Response): void => {
    const { credentials } = req.body;

    try {
      const selected: CredentialSource = credentials ? JSON.parse(credentials) : undefined;

      credVM.selectedCredential = selected;

      res.send(renderJSX(CredentialsCorner(credVM)));
    } catch (error) {
      console.error('Error parsing credentials:', error);
      res.send('<div class="text-sm text-red-600">Error parsing credentials</div>');
    }
  });

  // Handle credential selection
  router.post('/select-region', (req: Request, res: Response): void => {
    const { region } = req.body;

    credVM.selectedRegion = region ? region : undefined;

    res.send(renderJSX(CredentialsCorner(credVM)));
  });

  return router;
}
