const MODEL_OPTIONS = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
    },
  },
  toObject: { virtuals: true },
}

const DEFAULTS = {
  avatarUrl: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
  currency: 'USD',
}

// .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
// .regex(/[a-z]/, "Password must contain at least one lowercase letter")
// .regex(/[0-9]/, "Password must contain at least one number")
// .regex(/[!@#$%-^&*]/, "Password must contain at least one special character (!@#$%^&*)")
const VALIDATION_RULES = {
  password: {
    min: 8,
    max: 100,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*()_+-=[]{}|;:,.<>?~]/,
  },
  input: {
    min: 2,
    mid: 100,
    max: 500,
  },
}

const ERROR_MESSAGE = {
  required: (fieldName = 'Field') => `${fieldName} is required`,

  string: (fieldName = 'Field') => `${fieldName} must be a string`,
  stringMin: (fieldName = 'Field', min = VALIDATION_RULES.input.min) =>
    `${fieldName} must be at least ${min} characters`,
  stringMax: (fieldName = 'Field', max = VALIDATION_RULES.input.mid) =>
    `${fieldName} cannot exceed ${max} characters`,
  stringBetween: (
    fieldName = 'Field',
    min = VALIDATION_RULES.input.min,
    max = VALIDATION_RULES.input.max,
  ) => `${fieldName} must be between ${min} and ${max} characters`,

  number: (fieldName = 'Field') => `${fieldName} must be a number`,
  numberMin: (fieldName = 'Field', min = 0) =>
    `${fieldName} must be at least ${min}`,
  numberMax: (fieldName = 'Field', max = 100) =>
    `${fieldName} cannot exceed ${max}`,
  numberBetween: (fieldName = 'Field', min = 0, max = 100) =>
    `${fieldName} must be between ${min} and ${max}`,

  upperCase: (fieldName = 'Field') =>
    `${fieldName} must contain at least one uppercase letter`,
  lowerCase: (fieldName = 'Field') =>
    `${fieldName} must contain at least one lowercase letter`,
  numberCase: (fieldName = 'Field') =>
    `${fieldName} must contain at least one number`,
  specialCase: (fieldName = 'Field', specialChars = '!@#$%^&*') =>
    `${fieldName} must contain at least one special character (${specialChars})`,

  invalid: (fieldName = 'Field') => `Invalid ${fieldName}`,
}

const OPENAPI_METADATA_KEY = Symbol('openApiMetadata')

export {
  DEFAULTS,
  ERROR_MESSAGE,
  MODEL_OPTIONS,
  OPENAPI_METADATA_KEY,
  VALIDATION_RULES,
}
