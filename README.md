# AWS API Explorer

A web-based tool for exploring and testing AWS APIs with a user-friendly interface. Built with Node.js, Express, HTMX, and server-side JSX rendering.

## Features

- **Service Tree Navigation**: Browse AWS services organized by category
- **API Operation Discovery**: Explore available operations for each service
- **Request Template Generation**: Auto-generated JSON templates with required/optional field indicators
- **Multiple Credential Support**: Environment variables, AWS profiles, and EC2 instance roles
- **Real-time Execution**: Execute AWS API calls and see responses immediately
- **Request/Response Logging**: Persistent log of all API calls with timestamps and context
- **Syntax Highlighting**: JSON syntax highlighting with Prism.js
- **Responsive Design**: Works on desktop and mobile devices
- **SSH Tunnel Friendly**: Perfect for remote server deployment with SSH tunneling

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure AWS Credentials** (choose one):
   - Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
   - AWS CLI profiles: `~/.aws/credentials` and `~/.aws/config`
   - EC2 instance IAM roles (when running on EC2)

3. **Start the Server**
   ```bash
   npm start          # Production
   npm run dev        # Development with auto-reload
   ```

4. **Access the Application**
   - Local: http://localhost:3000
   - SSH Tunnel: `ssh -L 3000:localhost:3000 user@remote-server`

## Usage

### Basic Workflow

1. **Select Credentials**: Choose from detected AWS credentials in the dropdown
2. **Browse Services**: Expand service categories in the left sidebar
3. **Choose Operation**: Click on an API operation to load its template
4. **Edit Request**: Modify the JSON payload as needed
5. **Execute**: Click "Execute Request" to make the API call
6. **View Results**: See the response in the log section below

### Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Execute the current request
- `Tab`: Indent in JSON editor
- Auto-format JSON on blur

### Features in Detail

#### Service Tree
- Organized by AWS service categories (Compute, Storage, Database, etc.)
- Search/filter functionality
- Expandable tree structure
- HTMX-powered dynamic loading

#### Request Templates
- Pre-built templates for common AWS operations
- Visual indicators for required (red) vs optional (green) fields
- JSON validation and formatting
- Syntax highlighting

#### Credentials Management
- Automatic detection of available credentials
- Support for multiple credential types
- Region configuration
- Secure credential handling

#### Request Logging
- Chronological log of all API calls
- Success/failure indicators
- Request and response details
- Execution timing
- Clear and export functionality

## Architecture

### Technology Stack
- **Backend**: Node.js with Express
- **Frontend**: HTMX + minimal JavaScript
- **Templating**: Server-side JSX rendering
- **Styling**: Tailwind CSS
- **Syntax Highlighting**: Prism.js
- **AWS Integration**: AWS SDK for JavaScript v3

### Project Structure
```
aws-api-explorer/
├── server.js              # Main Express server
├── components/             # JSX components
│   ├── Layout.js
│   ├── ServicesTree.js
│   ├── ApiRequestForm.js
│   ├── CredentialsSelector.js
│   └── RequestLogger.js
├── routes/                 # Express route handlers
│   ├── services.js
│   ├── api-template.js
│   ├── credentials.js
│   ├── execute.js
│   └── logs.js
├── services/               # Business logic
│   ├── awsServices.js
│   ├── credentialsManager.js
│   ├── apiExecutor.js
│   └── requestLogger.js
└── public/                 # Static assets
    └── app.js
```

## Supported AWS Services

Currently includes templates for:
- **Compute**: EC2, Lambda, ECS
- **Storage**: S3, EBS
- **Database**: RDS, DynamoDB
- **Networking**: VPC, CloudFront
- **Security**: IAM, KMS
- **Monitoring**: CloudWatch, CloudTrail

## Development

### Adding New Services

1. Update `services/awsServices.js`:
   - Add service to `AWS_SERVICES` object
   - Add request templates to `getRequestTemplate()`

2. Install corresponding AWS SDK client:
   ```bash
   npm install @aws-sdk/client-[service-name]
   ```

3. Update `services/apiExecutor.js`:
   - Import the new client
   - Add to `SERVICE_CLIENTS` mapping

### Environment Variables

- `PORT`: Server port (default: 3000)
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_DEFAULT_REGION`: Default AWS region

## Security Considerations

- Credentials are never stored or logged
- All API calls use the selected credential context
- Request/response logging is in-memory only
- No persistent storage of sensitive data
- HTTPS recommended for production deployments

## SSH Tunneling

Perfect for remote development and secure access:

```bash
# Forward local port 3000 to remote server
ssh -L 3000:localhost:3000 user@remote-server

# Access via http://localhost:3000 in your local browser
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

### Common Issues

1. **No credentials detected**
   - Ensure AWS CLI is configured: `aws configure`
   - Check environment variables are set
   - Verify file permissions on `~/.aws/` directory

2. **API calls failing**
   - Check credential permissions for the specific service
   - Verify region settings
   - Check AWS service quotas and limits

3. **Server won't start**
   - Check if port 3000 is available
   - Verify Node.js version (requires Node 14+)
   - Check for missing dependencies: `npm install`

### Debug Mode

Set `NODE_ENV=development` for detailed error logging.

## Support

For issues and feature requests, please use the GitHub issue tracker.
