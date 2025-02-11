# Financial Management API

A comprehensive REST API for financial management built with Node.js, Express, and MongoDB. This API provides features for digital wallet management, transaction tracking, expense analytics, wishlists, and user notifications. It supports multi-currency transactions, subscription tracking, and shared wallet access.

## Features

- **User Management**
  - Authentication with JWT
  - User profiles and settings
  - Role-based access control

- **Financial Management**
  - Digital wallet management with multi-currency support
  - Transaction tracking and categorization
  - Expense analytics and reporting
  - Subscription management
  - Shared wallet access

- **Additional Features**
  - Wishlist management with sharing capabilities
  - Push notifications system
  - Real-time updates using Socket.IO
  - Comprehensive API documentation using OpenAPI 3.1.0

## Tech Stack

- Node.js with TypeScript
- Express.js for REST API
- MongoDB with Mongoose ODM
- Socket.IO for real-time features
- JWT for authentication
- Zod for validation
- Winston for logging
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v22.13.1 or later)
- MongoDB instance
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/api.git
   cd api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8001` by default.

### API Documentation

The API documentation is available in two formats:

- ReDoc UI: `/v1/docs`
- Scalar UI: `/v2/docs`

## Project Structure

- `/src/controller` - Request handlers and business logic
- `/src/model` - Database models and schemas
- `/src/routes` - API route definitions
- `/src/middleware` - Express middleware
- `/src/validation` - Request validation schemas
- `/src/services` - Business services
- `/src/utils` - Utility functions
- `/src/config` - Configuration files
- `/src/constants` - Constant definitions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run prettier` - Run Prettier check
- `npm run generate:openapi` - Generate OpenAPI documentation

## Testing

Run the test suite:

```bash
npm test
```

This will run the Jest test suite with coverage reporting.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Mucahid Yazar**
- Website: [mucahid.dev](https://mucahid.dev)
- Email: mucahidyazar@gmail.com

## Acknowledgments

- Built with TypeScript for enhanced type safety
- Uses modern JavaScript features and best practices
- Follows REST API design principles
- Implements comprehensive error handling
- Includes full API documentation
