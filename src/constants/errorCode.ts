export const ERROR_CODE = {
  None: 0,

  // Validation Errors (400000-400999) StatusCode 400
  ValidationError: 4000000,
  InvalidRequest: 4000001,
  InvalidParameters: 4000002,
  MalformedJson: 4000003,
  InvalidEntityStatus: 4000004,
  InvalidUserStatus: 4000005,
  DuplicateEntry: 4000006,
  BusinessRuleViolation: 4000007,
  EmailExists: 4000008,
  InvalidPassword: 4000009,
  NoChanges: 4000010,
  BadRequest: 4000011,

  // Authentication Errors (4010000-4019999) StatusCode 401
  Unauthorized: 4010000,
  InvalidToken: 4010001,
  TokenExpired: 4010002,
  InvalidCredentials: 4010003,

  // Authorization Errors (4030000-4039999) StatusCode 403
  InsufficientPermissions: 4030000,
  ResourceAccessDenied: 4030005,

  // Not Found Errors (4040000-4049999) StatusCode 404
  EntityNotFound: 4040000,
  TokenNotFound: 4040001,
  ResourceNotFound: 4040002,
  EndpointNotFound: 4040003,

  // Rate Limiter Errors (4290000-4299999) StatusCode 429
  RateLimitExceeded: 4290000,
  RateLimitExceededSignUp: 4290001,

  // Server Logic Errors (5000000-5009999) StatusCode 500
  InternalServerError: 5000000,
  DatabaseError: 5000001,
  CacheError: 5000002,
  UnexpectedError: 5000003,
  DataInconsistency: 5000004,
  ExternalServiceError: 5000005,
  ConfigurationError: 5000006,
  RedisConnectionError: 5000007,
  DatabaseConnectionError: 5000008,

  // Infrastructure Errors (5030000-5039999) StatusCode 503
  ServiceUnavailable: 5030000,
  DatabaseUnavailable: 5030001,
  CacheUnavailable: 5030002,
  DependencyUnavailable: 5030003,
  MaintenanceMode: 5030004,

  UnknownError: 9999999,
} as const
