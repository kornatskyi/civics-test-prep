#!/usr/bin/env bash
set -e

# Build frontend
cd client
npm install
npm run build
cd ..

# Install Python dependencies
pip install -r requirements.txt
