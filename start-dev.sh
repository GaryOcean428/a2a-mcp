#!/bin/bash
echo "Starting development server with local database..."
export DATABASE_URL=postgresql://app_user:password@localhost:5432/app_db
export NODE_ENV=development
npm run dev
