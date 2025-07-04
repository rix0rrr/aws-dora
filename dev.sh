#!/bin/bash

# AWS API Explorer Development Startup Script (TypeScript)

echo "Starting AWS API Explorer in development mode with TypeScript..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 14+ and try again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Set default port if not specified
if [ -z "$PORT" ]; then
    export PORT=3000
fi

echo "Starting TypeScript development server with auto-reload..."
echo "Access the application at: http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
