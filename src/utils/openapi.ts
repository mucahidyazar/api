import { writeFileSync } from 'fs'

import { createDocument } from 'zod-openapi'

import openApiPaths from '../routes/v1'

// Create your OpenAPI document
const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation generated using Zod and zod-openapi',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  paths: openApiPaths,
  // Optionally add components, security, etc.
})

// Write the generated OpenAPI document to a JSON file
writeFileSync('./docs/openapi.json', JSON.stringify(openApiDocument, null, 2))

console.log('OpenAPI spec generated successfully.')
