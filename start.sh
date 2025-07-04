#!/bin/bash

# AWS API Explorer Startup Script

echo "Starting AWS API Explorer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 14+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "Error: Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 14+ and try again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies."
        exit 1
    fi
fi

# Set default port if not specified
if [ -z "$PORT" ]; then
    export PORT=3000
fi

# Check if port is available
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "Error: Port $PORT is already in use. Please set a different PORT environment variable."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
if [ -z "$AWS_ACCESS_KEY_ID" ] && [ ! -f "$HOME/.aws/credentials" ]; then
    echo "Warning: No AWS credentials detected."
    echo "Please configure credentials using one of these methods:"
    echo "  1. Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
    echo "  2. AWS CLI: aws configure"
    echo "  3. EC2 instance IAM role (when running on EC2)"
    echo ""
fi

# Start the server
echo "Starting server on port $PORT..."
echo "Access the application at: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

npm start
