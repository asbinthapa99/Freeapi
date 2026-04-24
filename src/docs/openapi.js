const { ROLE_PERMISSIONS } = require('../config/rbac');

const jsonBody = (schema) => ({
  required: true,
  content: {
    'application/json': {
      schema
    }
  }
});

const queryParam = (name, type, required = false, description) => ({
  in: 'query',
  name,
  required,
  schema: { type },
  description
});

const pathParam = (name, type = 'string', description) => ({
  in: 'path',
  name,
  required: true,
  schema: { type },
  description
});

const secured = [{ bearerAuth: [] }];

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Nepal API Ecosystem',
    version: '1.2.0',
    description: 'Production-oriented REST APIs for Nepal market use cases with Mongo-backed catalog data, JWT auth, refresh tokens, RBAC, observability, and integration-ready providers.'
  },
  servers: [{ url: '/' }],
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
            items: { type: 'string', enum: Object.keys(ROLE_PERMISSIONS) }
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
      UserUpdateRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          full_name: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          permissions: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['ACTIVE', 'DISABLED'] }
        }
      },
      User: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          full_name: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          permissions: { type: 'array', items: { type: 'string' } },
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
          user: { $ref: '#/components/schemas/User' }
        }
      },
      TranslateRequest: {
        type: 'object',
        required: ['text', 'source_lang', 'target_lang'],
        properties: {
          text: { type: 'string' },
          source_lang: { type: 'string' },
          target_lang: { type: 'string' }
        }
      },
      TextRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string' }
        }
      },
      AgriDiseaseRequest: {
        type: 'object',
        required: ['crop', 'symptoms'],
        properties: {
          crop: { type: 'string' },
          symptoms: { type: 'array', items: { type: 'string' } }
        }
      },
      AgriFertilizerRequest: {
        type: 'object',
        required: ['crop'],
        properties: {
          crop: { type: 'string' },
          soil_type: { type: 'string' }
        }
      },
      DisasterSubscriptionRequest: {
        type: 'object',
        required: ['phone', 'district'],
        properties: {
          phone: { type: 'string' },
          district: { type: 'string' },
          alert_types: { type: 'array', items: { type: 'string' } }
        }
      },
      EducationTutorRequest: {
        type: 'object',
        required: ['question'],
        properties: {
          question: { type: 'string' },
          grade_level: { type: 'string' }
        }
      },
      EducationObjectiveRequest: {
        type: 'object',
        required: ['answers', 'answer_key'],
        properties: {
          answers: { type: 'array', items: { type: 'string' } },
          answer_key: { type: 'array', items: { type: 'string' } }
        }
      },
      EducationEssayRequest: {
        type: 'object',
        required: ['essay'],
        properties: {
          essay: { type: 'string' }
        }
      },
      FinanceRemittanceRequest: {
        type: 'object',
        required: ['amount', 'from_currency', 'to_currency'],
        properties: {
          amount: { type: 'number' },
          from_currency: { type: 'string' },
          to_currency: { type: 'string' }
        }
      },
      FinancePaymentRequest: {
        type: 'object',
        required: ['amount', 'channel'],
        properties: {
          amount: { type: 'number' },
          currency: { type: 'string', default: 'NPR' },
          channel: { type: 'string', enum: ['CARD', 'KHALTI', 'ESEWA', 'CONNECT_IPS'] },
          reference: { type: 'string' }
        }
      },
      FinanceBudgetRequest: {
        type: 'object',
        required: ['entries'],
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              required: ['description', 'amount'],
              properties: {
                description: { type: 'string' },
                amount: { type: 'number' }
              }
            }
          }
        }
      },
      GovDocumentRequest: {
        type: 'object',
        required: ['document_number', 'document_type'],
        properties: {
          document_number: { type: 'string' },
          document_type: { type: 'string' },
          holder_name: { type: 'string' }
        }
      },
      HealthTriageRequest: {
        type: 'object',
        required: ['symptoms'],
        properties: {
          symptoms: { type: 'array', items: { type: 'string' } },
          patient_age: { type: 'integer' },
          patient_location_district: { type: 'string' },
          duration_days: { type: 'integer' }
        }
      },
      HealthSyncRequest: {
        type: 'object',
        required: ['records'],
        properties: {
          records: {
            type: 'array',
            items: { type: 'object', additionalProperties: true }
          }
        }
      },
      JobsParseRequest: {
        type: 'object',
        required: ['resume_text'],
        properties: {
          resume_text: { type: 'string' }
        }
      },
      JobsMatchRequest: {
        type: 'object',
        required: ['skills'],
        properties: {
          skills: { type: 'array', items: { type: 'string' } },
          preferred_type: { type: 'string' }
        }
      },
      JobsPostRequest: {
        type: 'object',
        required: ['title', 'company', 'location', 'category', 'type'],
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          location: { type: 'string' },
          category: { type: 'string' },
          type: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } }
        }
      },
      TourismPermitRequest: {
        type: 'object',
        required: ['trek_id', 'passport_number', 'nationality'],
        properties: {
          trek_id: { type: 'string' },
          passport_number: { type: 'string' },
          nationality: { type: 'string' }
        }
      },
      TourismItineraryRequest: {
        type: 'object',
        required: ['trek_id'],
        properties: {
          trek_id: { type: 'string' }
        }
      },
      TourismAltitudeRequest: {
        type: 'object',
        required: ['start_alt', 'end_alt'],
        properties: {
          start_alt: { type: 'number' },
          end_alt: { type: 'number' }
        }
      },
      TransportFareRequest: {
        type: 'object',
        required: ['distance_km', 'vehicle_type'],
        properties: {
          distance_km: { type: 'number' },
          vehicle_type: { type: 'string' },
          is_student: { type: 'boolean' }
        }
      },
      TransportBookingRequest: {
        type: 'object',
        required: ['route_id', 'passenger_name', 'date'],
        properties: {
          route_id: { type: 'string' },
          passenger_name: { type: 'string' },
          date: { type: 'string', format: 'date' }
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
        security: secured,
        responses: { 200: { description: 'Prometheus metrics text payload' } }
      }
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: jsonBody({ $ref: '#/components/schemas/RegisterRequest' }),
        responses: { 201: { description: 'User created' } }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive access + refresh tokens',
        requestBody: jsonBody({ $ref: '#/components/schemas/LoginRequest' }),
        responses: { 200: { description: 'Authenticated' } }
      }
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh an access token',
        requestBody: jsonBody({ $ref: '#/components/schemas/RefreshTokenRequest' }),
        responses: { 200: { description: 'New token pair' } }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Revoke a refresh token',
        requestBody: jsonBody({ $ref: '#/components/schemas/RefreshTokenRequest' }),
        responses: { 200: { description: 'Token revoked' } }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: secured,
        responses: { 200: { description: 'Current user profile' } }
      }
    },
    '/api/v1/auth/users': {
      get: {
        tags: ['Auth'],
        summary: 'List users',
        security: secured,
        responses: { 200: { description: 'User list' } }
      },
      post: {
        tags: ['Auth'],
        summary: 'Create user',
        security: secured,
        requestBody: jsonBody({ $ref: '#/components/schemas/RegisterRequest' }),
        responses: { 201: { description: 'User created' } }
      }
    },
    '/api/v1/auth/users/{user_id}': {
      patch: {
        tags: ['Auth'],
        summary: 'Update user',
        security: secured,
        parameters: [pathParam('user_id', 'string', 'User identifier')],
        requestBody: jsonBody({ $ref: '#/components/schemas/UserUpdateRequest' }),
        responses: { 200: { description: 'User updated' } }
      },
      delete: {
        tags: ['Auth'],
        summary: 'Delete user',
        security: secured,
        parameters: [pathParam('user_id', 'string', 'User identifier')],
        responses: { 200: { description: 'User deleted' } }
      }
    },
    '/api/v1/language/translate': {
      post: {
        tags: ['Language'],
        summary: 'Translate text',
        requestBody: jsonBody({ $ref: '#/components/schemas/TranslateRequest' }),
        responses: { 200: { description: 'Translation result' } }
      }
    },
    '/api/v1/language/transliterate': {
      post: {
        tags: ['Language'],
        summary: 'Transliterate romanized Nepali to Devanagari',
        requestBody: jsonBody({ $ref: '#/components/schemas/TranslateRequest' }),
        responses: { 200: { description: 'Transliteration result' } }
      }
    },
    '/api/v1/language/sentiment': {
      post: {
        tags: ['Language'],
        summary: 'Analyze text sentiment',
        requestBody: jsonBody({ $ref: '#/components/schemas/TextRequest' }),
        responses: { 200: { description: 'Sentiment result' } }
      }
    },
    '/api/v1/language/ner': {
      post: {
        tags: ['Language'],
        summary: 'Extract named entities',
        requestBody: jsonBody({ $ref: '#/components/schemas/TextRequest' }),
        responses: { 200: { description: 'NER result' } }
      }
    },
    '/api/v1/language/detect': {
      get: {
        tags: ['Language'],
        summary: 'Detect language',
        parameters: [queryParam('text', 'string', true, 'Input text')],
        responses: { 200: { description: 'Language detection result' } }
      }
    },
    '/api/v1/agri/prices/kalimati': {
      get: {
        tags: ['Agriculture'],
        summary: 'Get Kalimati market prices',
        parameters: [
          queryParam('date', 'string', false, 'Optional date filter'),
          queryParam('commodity', 'string', false, 'Commodity name')
        ],
        responses: { 200: { description: 'Price list' } }
      }
    },
    '/api/v1/agri/disease/analyze': {
      post: {
        tags: ['Agriculture'],
        summary: 'Analyze crop disease from symptoms',
        requestBody: jsonBody({ $ref: '#/components/schemas/AgriDiseaseRequest' }),
        responses: { 200: { description: 'Disease analysis result' } }
      }
    },
    '/api/v1/agri/weather/forecast': {
      get: {
        tags: ['Agriculture'],
        summary: 'Get agriculture weather forecast',
        parameters: [
          queryParam('lat', 'number', true, 'Latitude'),
          queryParam('lon', 'number', true, 'Longitude')
        ],
        responses: { 200: { description: 'Forecast result' } }
      }
    },
    '/api/v1/agri/fertilizer/recommend': {
      post: {
        tags: ['Agriculture'],
        summary: 'Get fertilizer recommendation',
        requestBody: jsonBody({ $ref: '#/components/schemas/AgriFertilizerRequest' }),
        responses: { 200: { description: 'Recommendation result' } }
      }
    },
    '/api/v1/agri/crops/calendar': {
      get: {
        tags: ['Agriculture'],
        summary: 'Get crop calendar',
        responses: { 200: { description: 'Crop calendar' } }
      }
    },
    '/api/v1/disaster/alerts/active': {
      get: {
        tags: ['Disaster'],
        summary: 'Get active alerts',
        parameters: [
          queryParam('district', 'string', false, 'District name'),
          queryParam('severity', 'string', false, 'Severity filter')
        ],
        responses: { 200: { description: 'Active alerts' } }
      }
    },
    '/api/v1/disaster/rivers/levels': {
      get: {
        tags: ['Disaster'],
        summary: 'Get river levels',
        parameters: [
          queryParam('river', 'string', false, 'River name'),
          queryParam('station', 'string', false, 'Station name')
        ],
        responses: { 200: { description: 'River levels' } }
      }
    },
    '/api/v1/disaster/subscriptions/register': {
      post: {
        tags: ['Disaster'],
        summary: 'Register alert subscription',
        requestBody: jsonBody({ $ref: '#/components/schemas/DisasterSubscriptionRequest' }),
        responses: { 201: { description: 'Subscription created' } }
      }
    },
    '/api/v1/disaster/landslide-risk': {
      get: {
        tags: ['Disaster'],
        summary: 'Get landslide risk zones',
        parameters: [queryParam('district', 'string', false, 'District name')],
        responses: { 200: { description: 'Risk zones' } }
      }
    },
    '/api/v1/disaster/earthquakes/recent': {
      get: {
        tags: ['Disaster'],
        summary: 'Get recent earthquakes',
        responses: { 200: { description: 'Recent earthquakes' } }
      }
    },
    '/api/v1/education/tutor/ask': {
      post: {
        tags: ['Education'],
        summary: 'Ask the tutor',
        requestBody: jsonBody({ $ref: '#/components/schemas/EducationTutorRequest' }),
        responses: { 200: { description: 'Tutor response' } }
      }
    },
    '/api/v1/education/syllabus/topics': {
      get: {
        tags: ['Education'],
        summary: 'Get syllabus topics',
        parameters: [queryParam('grade', 'string', false, 'Grade or level')],
        responses: { 200: { description: 'Topics list' } }
      }
    },
    '/api/v1/education/syllabus/{grade}': {
      get: {
        tags: ['Education'],
        summary: 'Get syllabus by grade',
        parameters: [pathParam('grade', 'string', 'Grade identifier')],
        responses: { 200: { description: 'Syllabus data' } }
      }
    },
    '/api/v1/education/past-papers': {
      get: {
        tags: ['Education'],
        summary: 'Get past papers with query filters',
        parameters: [
          queryParam('subject', 'string', false, 'Subject'),
          queryParam('grade', 'string', false, 'Grade'),
          queryParam('year', 'number', false, 'Year')
        ],
        responses: { 200: { description: 'Past papers' } }
      }
    },
    '/api/v1/education/past-papers/{subject}/{year}': {
      get: {
        tags: ['Education'],
        summary: 'Get past papers by subject and year',
        parameters: [
          pathParam('subject', 'string', 'Subject'),
          pathParam('year', 'number', 'Year')
        ],
        responses: { 200: { description: 'Past papers' } }
      }
    },
    '/api/v1/education/grade/objective': {
      post: {
        tags: ['Education'],
        summary: 'Grade objective answers',
        requestBody: jsonBody({ $ref: '#/components/schemas/EducationObjectiveRequest' }),
        responses: { 200: { description: 'Objective grading result' } }
      }
    },
    '/api/v1/education/grade/essay': {
      post: {
        tags: ['Education'],
        summary: 'Grade essay answer',
        requestBody: jsonBody({ $ref: '#/components/schemas/EducationEssayRequest' }),
        responses: { 200: { description: 'Essay grading result' } }
      }
    },
    '/api/v1/finance/forex/rates': {
      get: {
        tags: ['Finance'],
        summary: 'Get forex rates',
        parameters: [queryParam('date', 'string', false, 'Optional date')],
        responses: { 200: { description: 'Forex rates' } }
      }
    },
    '/api/v1/finance/remittance/{tracking_code}': {
      get: {
        tags: ['Finance'],
        summary: 'Track remittance',
        parameters: [pathParam('tracking_code', 'string', 'Tracking code')],
        responses: { 200: { description: 'Remittance details' } }
      }
    },
    '/api/v1/finance/remittance/calculate': {
      post: {
        tags: ['Finance'],
        summary: 'Calculate remittance conversion',
        requestBody: jsonBody({ $ref: '#/components/schemas/FinanceRemittanceRequest' }),
        responses: { 200: { description: 'Calculation result' } }
      }
    },
    '/api/v1/finance/payments/initiate': {
      post: {
        tags: ['Finance'],
        summary: 'Create a live payment intent or provider payment session',
        security: secured,
        requestBody: jsonBody({ $ref: '#/components/schemas/FinancePaymentRequest' }),
        responses: { 201: { description: 'Payment initiated' } }
      }
    },
    '/api/v1/finance/banks/branches': {
      get: {
        tags: ['Finance'],
        summary: 'List bank branches',
        parameters: [
          queryParam('bank', 'string', false, 'Bank name'),
          queryParam('district', 'string', false, 'District')
        ],
        responses: { 200: { description: 'Bank branches' } }
      }
    },
    '/api/v1/finance/inflation': {
      get: {
        tags: ['Finance'],
        summary: 'Get inflation data',
        responses: { 200: { description: 'Inflation data' } }
      }
    },
    '/api/v1/finance/budget/categorize': {
      post: {
        tags: ['Finance'],
        summary: 'Categorize budget entries',
        requestBody: jsonBody({ $ref: '#/components/schemas/FinanceBudgetRequest' }),
        responses: { 200: { description: 'Budget categorization result' } }
      }
    },
    '/api/v1/gov/applications/status/{tracking_id}': {
      get: {
        tags: ['Government'],
        summary: 'Track government application status',
        parameters: [pathParam('tracking_id', 'string', 'Tracking ID')],
        responses: { 200: { description: 'Application status' } }
      }
    },
    '/api/v1/gov/documents/verify': {
      post: {
        tags: ['Government'],
        summary: 'Create a document verification inquiry',
        security: secured,
        requestBody: jsonBody({ $ref: '#/components/schemas/GovDocumentRequest' }),
        responses: { 200: { description: 'Verification provider response' } }
      }
    },
    '/api/v1/gov/holidays': {
      get: {
        tags: ['Government'],
        summary: 'List public holidays',
        parameters: [
          queryParam('year', 'number', false, 'Year'),
          queryParam('month', 'string', false, 'Month number')
        ],
        responses: { 200: { description: 'Holiday list' } }
      }
    },
    '/api/v1/gov/holidays/{year}': {
      get: {
        tags: ['Government'],
        summary: 'List public holidays by year',
        parameters: [pathParam('year', 'number', 'Year')],
        responses: { 200: { description: 'Holiday list' } }
      }
    },
    '/api/v1/gov/offices/ward': {
      get: {
        tags: ['Government'],
        summary: 'Get ward office information',
        parameters: [
          queryParam('ward', 'number', false, 'Ward number'),
          queryParam('municipality', 'string', false, 'Municipality name')
        ],
        responses: { 200: { description: 'Ward offices' } }
      }
    },
    '/api/v1/gov/tax/vehicle-rates': {
      get: {
        tags: ['Government'],
        summary: 'Get vehicle tax rates',
        responses: { 200: { description: 'Vehicle tax rates' } }
      }
    },
    '/api/v1/health/triage/analyze': {
      post: {
        tags: ['Health'],
        summary: 'Analyze symptoms for triage',
        requestBody: jsonBody({ $ref: '#/components/schemas/HealthTriageRequest' }),
        responses: { 200: { description: 'Triage result' } }
      }
    },
    '/api/v1/health/facilities/nearby': {
      get: {
        tags: ['Health'],
        summary: 'List nearby facilities',
        parameters: [
          queryParam('district', 'string', false, 'District'),
          queryParam('type', 'string', false, 'Facility type')
        ],
        responses: { 200: { description: 'Nearby facilities' } }
      }
    },
    '/api/v1/health/first-aid/{condition}': {
      get: {
        tags: ['Health'],
        summary: 'Get first-aid guide',
        parameters: [pathParam('condition', 'string', 'Condition key')],
        responses: { 200: { description: 'First-aid guide' } }
      }
    },
    '/api/v1/health/sync/offline-records': {
      post: {
        tags: ['Health'],
        summary: 'Sync offline records',
        security: secured,
        requestBody: jsonBody({ $ref: '#/components/schemas/HealthSyncRequest' }),
        responses: { 200: { description: 'Sync result' } }
      }
    },
    '/api/v1/health/diseases/outbreaks': {
      get: {
        tags: ['Health'],
        summary: 'Get outbreak data',
        responses: { 200: { description: 'Outbreaks' } }
      }
    },
    '/api/v1/jobs/resume/parse': {
      post: {
        tags: ['Jobs'],
        summary: 'Parse resume text',
        requestBody: jsonBody({ $ref: '#/components/schemas/JobsParseRequest' }),
        responses: { 200: { description: 'Resume parsing result' } }
      }
    },
    '/api/v1/jobs/match': {
      post: {
        tags: ['Jobs'],
        summary: 'Match candidate to jobs',
        requestBody: jsonBody({ $ref: '#/components/schemas/JobsMatchRequest' }),
        responses: { 200: { description: 'Job matches' } }
      }
    },
    '/api/v1/jobs/search': {
      get: {
        tags: ['Jobs'],
        summary: 'Search jobs',
        parameters: [
          queryParam('category', 'string', false, 'Category'),
          queryParam('type', 'string', false, 'Job type'),
          queryParam('location', 'string', false, 'Location')
        ],
        responses: { 200: { description: 'Search results' } }
      }
    },
    '/api/v1/jobs/foreign-demands/verify/{lt_number}': {
      get: {
        tags: ['Jobs'],
        summary: 'Verify foreign labor demand',
        parameters: [pathParam('lt_number', 'string', 'Labor approval number')],
        responses: { 200: { description: 'Demand verification result' } }
      }
    },
    '/api/v1/jobs/categories': {
      get: {
        tags: ['Jobs'],
        summary: 'List job categories',
        responses: { 200: { description: 'Job categories' } }
      }
    },
    '/api/v1/jobs/post': {
      post: {
        tags: ['Jobs'],
        summary: 'Post a job',
        security: secured,
        requestBody: jsonBody({ $ref: '#/components/schemas/JobsPostRequest' }),
        responses: { 201: { description: 'Job created' } }
      }
    },
    '/api/v1/tourism/treks/routes': {
      get: {
        tags: ['Tourism'],
        summary: 'List trekking routes',
        parameters: [
          queryParam('region', 'string', false, 'Region'),
          queryParam('difficulty', 'string', false, 'Difficulty')
        ],
        responses: { 200: { description: 'Trekking routes' } }
      }
    },
    '/api/v1/tourism/permits/apply': {
      post: {
        tags: ['Tourism'],
        summary: 'Apply for a trek permit',
        requestBody: jsonBody({ $ref: '#/components/schemas/TourismPermitRequest' }),
        responses: { 201: { description: 'Permit application created' } }
      }
    },
    '/api/v1/tourism/permits/{permit_id}/status': {
      get: {
        tags: ['Tourism'],
        summary: 'Get permit status',
        parameters: [pathParam('permit_id', 'string', 'Permit ID')],
        responses: { 200: { description: 'Permit status' } }
      }
    },
    '/api/v1/tourism/itinerary/generate': {
      post: {
        tags: ['Tourism'],
        summary: 'Generate itinerary',
        requestBody: jsonBody({ $ref: '#/components/schemas/TourismItineraryRequest' }),
        responses: { 200: { description: 'Generated itinerary' } }
      }
    },
    '/api/v1/tourism/teahouses/availability': {
      get: {
        tags: ['Tourism'],
        summary: 'List teahouse availability',
        parameters: [
          queryParam('location', 'string', false, 'Location'),
          queryParam('max_price', 'number', false, 'Max nightly price')
        ],
        responses: { 200: { description: 'Teahouse results' } }
      }
    },
    '/api/v1/tourism/health/altitude-risk': {
      post: {
        tags: ['Tourism'],
        summary: 'Calculate altitude risk',
        requestBody: jsonBody({ $ref: '#/components/schemas/TourismAltitudeRequest' }),
        responses: { 200: { description: 'Altitude risk result' } }
      }
    },
    '/api/v1/transport/routes/search': {
      get: {
        tags: ['Transport'],
        summary: 'Search local routes',
        parameters: [
          queryParam('start', 'string', false, 'Start stop'),
          queryParam('end', 'string', false, 'End stop')
        ],
        responses: { 200: { description: 'Route search results' } }
      }
    },
    '/api/v1/transport/fares/calculate': {
      get: {
        tags: ['Transport'],
        summary: 'Calculate fare with query params',
        parameters: [
          queryParam('distance_km', 'number', false, 'Distance in km'),
          queryParam('vehicle_type', 'string', false, 'Vehicle type'),
          queryParam('is_student', 'boolean', false, 'Student discount')
        ],
        responses: { 200: { description: 'Fare calculation result' } }
      },
      post: {
        tags: ['Transport'],
        summary: 'Calculate fare with request body',
        requestBody: jsonBody({ $ref: '#/components/schemas/TransportFareRequest' }),
        responses: { 200: { description: 'Fare calculation result' } }
      }
    },
    '/api/v1/transport/routes/intercity': {
      get: {
        tags: ['Transport'],
        summary: 'List intercity routes',
        parameters: [
          queryParam('from', 'string', false, 'Origin city'),
          queryParam('to', 'string', false, 'Destination city')
        ],
        responses: { 200: { description: 'Intercity routes' } }
      }
    },
    '/api/v1/transport/buses/{bus_id}/location': {
      get: {
        tags: ['Transport'],
        summary: 'Get current bus or route location',
        parameters: [pathParam('bus_id', 'string', 'Bus or route ID')],
        responses: { 200: { description: 'Bus location' } }
      }
    },
    '/api/v1/transport/tickets/book': {
      post: {
        tags: ['Transport'],
        summary: 'Book ticket',
        requestBody: jsonBody({ $ref: '#/components/schemas/TransportBookingRequest' }),
        responses: { 201: { description: 'Ticket booked' } }
      }
    },
    '/api/v1/transport/seats/{trip_id}': {
      get: {
        tags: ['Transport'],
        summary: 'Get seat availability',
        parameters: [pathParam('trip_id', 'string', 'Trip ID')],
        responses: { 200: { description: 'Seat availability' } }
      }
    }
  }
};

module.exports = openApiDocument;
