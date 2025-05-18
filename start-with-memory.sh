#!/bin/bash
# Script to start Flowise with increased memory limits

# Set Node.js memory limit to 4GB (adjust as needed)
export NODE_OPTIONS="--max-old-space-size=4096"

# Start the server
cd packages/server
npm run start
