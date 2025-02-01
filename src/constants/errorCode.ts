export const ERROR_CODE = {
  None: 0,

  // Validation Errors (1000-1999) StatusCode 400
  ValidationError: 1000,
  InvalidRequest: 1001,
  InvalidParameters: 1002,
  MalformedJson: 1003,
  InvalidEntityStatus: 1004,
  InvalidUserStatus: 1005,
  DuplicateEntry: 1007,
  BusinessRuleViolation: 1008,
  EmailExists: 1009,
  InvalidPassword: 1010,
  NoChanges: 1011,
  BadRequest: 1012,

  // Authentication Errors (2000-2999) StatusCode 401
  Unauthorized: 2000,
  InvalidToken: 2001,
  TokenExpired: 2002,
  InvalidCredentials: 2003,

  // Authorization Errors (3000-3999) StatusCode 403
  InsufficientPermissions: 3000,
  ResourceAccessDenied: 3005,

  // Not Found Errors (4000-4999) StatusCode 404
  EntityNotFound: 4000,
  TokenNotFound: 4004,
  ResourceNotFound: 4005,
  EndpointNotFound: 4006,

  // Server Logic Errors (5000-5999) StatusCode 500
  InternalServerError: 5000,
  DatabaseError: 5001,
  CacheError: 5002,
  UnexpectedError: 5003,
  DataInconsistency: 5004,
  ExternalServiceError: 5005,
  ConfigurationError: 5006,
  RedisConnectionError: 5007,
  DatabaseConnectionError: 5008,

  // Infrastructure Errors (6000-6999) StatusCode 503
  ServiceUnavailable: 6000,
  DatabaseUnavailable: 6001,
  CacheUnavailable: 6002,
  DependencyUnavailable: 6003,
  MaintenanceMode: 6004,

  UnknownError: 9999,
} as const
