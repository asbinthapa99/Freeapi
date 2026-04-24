const { ROLE_PERMISSIONS } = require('../config/rbac');

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Nepal API Ecosystem',
    version: '1.1.0',
    description: 'Production-oriented REST APIs for Nepal market use cases with Mongo-backed catalog data, JWT auth, refresh tokens, RBAC, and observability.'
  },
  servers: [
    {
      url: '/'
    }
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Language' },
    { name: 'Agriculture' },
    { name: 'Disaster' },
    { name: 'Education' },
    { name: 'Finance' },
    { name: 'Government' },
    { name: 'Health' },
    { name: 'Jobs' },
    { name: 'Tourism' },
    { name: 'Transport' },
    { name: 'Observability' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'full_name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          full_name: { type: 'string' },
          roles: {
            type: 'array',
            items: {
              type: 'string',
              enum: Object.keys(ROLE_PERMISSIONS)
            }
          },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: {
          refresh_token: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          full_name: { type: 'string' },
          roles: {
            type: 'array',
            items: { type: 'string' }
          },
          permissions: {
            type: 'array',
            items: { type: 'string' }
          },
          status: { type: 'string' }
        }
      },
      AuthTokens: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          token_type: { type: 'string' },
          expires_in: { type: 'string' },
          user: {
            $ref: '#/components/schemas/User'
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Observability'],
        summary: 'Liveness health check',
        responses: { 200: { description: 'Service health' } }
      }
    },
    '/ready': {
      get: {
        tags: ['Observability'],
        summary: 'Readiness check',
        responses: { 200: { description: 'Service readiness' } }
      }
    },
    '/metrics': {
      get: {
        tags: ['Observability'],
        summary: 'Prometheus metrics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Prometheus metrics text payload' } }
      }
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: { 201: { description: 'User created' } }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access + refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthTokens' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: { 200: { description: 'New token pair' } }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke a refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: { 200: { description: 'Token revoked' } }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Current user profile' } }
      }
    },
    '/api/v1/auth/users': {
      get: {
        tags: ['Auth'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User list' } }
      },
      post: {
        tags: ['Auth'],
        summary: 'Create user',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'User created' } }
      }
    },
    '/api/v1/auth/users/{userId}': {
      patch: {
        tags: ['Auth'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User updated' } }
      },
      delete: {
        tags: ['Auth'],
        summary: 'Delete user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'userId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User deleted' } }
      }
    },
    '/api/v1/finance/payments/initiate': {
      post: {
        tags: ['Finance'],
        summary: 'Create a live payment intent or provider payment session',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Payment initiated' } }
      }
    },
    '/api/v1/gov/documents/verify': {
      post: {
        tags: ['Government'],
        summary: 'Create a document verification inquiry',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Verification provider response' } }
      }
    }
  }
};

module.exports = openApiDocument;
