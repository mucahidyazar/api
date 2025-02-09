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
  'x-tagGroups': [
    {
      name: 'User Management',
      tags: ['Auth', 'User'],
    },
    {
      name: 'Financial Management',
      tags: ['Transaction', 'Wallet', 'Calculation'],
    },
    {
      name: 'Features',
      tags: ['Wishlist'],
    },
    {
      name: 'Notifications',
      tags: ['Notification', 'Push.Token'],
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints for user sign-in and sign-up',
      'x-tagGroup': 'User Management',
    },
    {
      name: 'User',
      description: 'User profile management and settings',
      'x-tagGroup': 'User Management',
    },
    {
      name: 'Setting',
      description: 'Application and user settings management',
      'x-tagGroup': 'User Management',
    },

    // Financial Management
    {
      name: 'Transaction',
      description:
        'Financial transaction operations including creation, updates, and analytics',
      'x-tagGroup': 'Financial Management',
    },
    {
      name: 'Transaction.Brand',
      description: 'Management of transaction brands/vendors',
      'x-tagGroup': 'Financial Management',
    },
    {
      name: 'Transaction.Category',
      description: 'Categories for organizing and classifying transactions',
      'x-tagGroup': 'Financial Management',
    },
    {
      name: 'Wallet',
      description:
        'Digital wallet management including balance and transactions',
      'x-tagGroup': 'Financial Management',
    },
    {
      name: 'Calculation',
      description: 'Financial calculations and analytics',
      'x-tagGroup': 'Financial Management',
    },

    // Features
    {
      name: 'Wishlist',
      description: 'User wishlist management and sharing',
      'x-tagGroup': 'Features',
    },

    // Notifications
    {
      name: 'Notification',
      description: 'System notifications and user alerts',
      'x-tagGroup': 'Notifications',
    },
    {
      name: 'Push.Token',
      description: 'Device push notification token management',
      'x-tagGroup': 'Notifications',
    },
  ],
  paths: openApiPaths,
  // Optionally add components, security, etc.
})

// Write the generated OpenAPI document to a JSON file
writeFileSync('./docs/openapi.json', JSON.stringify(openApiDocument, null, 2))

console.log('OpenAPI spec generated successfully.')
