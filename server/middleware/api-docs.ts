/**
 * API Documentation Middleware
 * 
 * This middleware serves OpenAPI documentation using Swagger UI.
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

/**
 * Load the OpenAPI specification from the YAML file
 */
function loadApiSpec() {
  try {
    const apiDocsPath = path.resolve(process.cwd(), 'api-docs.yaml');
    const fileContents = fs.readFileSync(apiDocsPath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error('Error loading API specification:', error);
    return {
      openapi: '3.0.0',
      info: {
        title: 'MCP Integration Platform API',
        version: '0.1.0-alpha',
        description: 'API documentation not available. Please check the api-docs.yaml file.'
      }
    };
  }
}

/**
 * Set up Swagger UI middleware
 */
export function setupApiDocs(app: express.Express) {
  // Load the API specification
  const apiSpec = loadApiSpec();
  
  // Set up Swagger UI options
  const options = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }'
  };
  
  // Mount Swagger UI
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec, options));
  
  // Mount raw OpenAPI specification for machine consumption
  app.get('/api/openapi.json', (req, res) => {
    res.json(apiSpec);
  });
  
  console.log('API documentation available at /api/docs');
}
