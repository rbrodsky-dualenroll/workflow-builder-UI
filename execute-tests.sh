#!/bin/bash

# Start dev server in background
npm run dev &

# Save PID so we can clean it up
DEV_PID=$!

# Wait for the server to be ready
echo "Waiting for dev server on localhost:5173..."
until curl --output /dev/null --silent --head --fail http://localhost:5173; do
  echo "Waiting..."
  sleep 1
done

# Run tests
cd workflow-builder-UI
npm run test:ci

# Clean up
kill $DEV_PID
