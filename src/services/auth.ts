import jwt from 'jsonwebtoken'
import { z } from 'zod'

import { ERROR_CODE } from '@/constants'
import { ApiError } from '@/errors/api-error'
import { signInDto, signUpDto } from '@/model/request/auth.dto'
import { User } from '@/model/user'

/**
 * Generates a JWT access token for a user
 * @param {Object} user - The user object containing authentication information
 * @param {string} user._id - The unique identifier of the user
 * @param {string} user.email - The email address of the user
 * @param {string} user.role - The role of the user (e.g., 'user', 'admin')
 * @returns {string} JWT access token valid for 1 day
 */
const generateAccessToken = user => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    'your_access_token_secret',
    {
      expiresIn: '1d',
    },
  )
}

/**
 * Creates a new user account and generates an access token
 * @param {z.infer<typeof signUpDto>} model - The user sign-up data
 * @returns {Promise<string>} JWT access token for the newly created user
 * @throws {TApiError} If there's an error during user creation or if email already exists
 */
const signUpUser = async (model: z.infer<typeof signUpDto>) => {
  const user = new User(model)
  await user.save()
  return generateAccessToken(user)
}

/**
 * Authenticates a user and generates an access token
 * @param {z.infer<typeof signInDto>} model - The user sign-in data
 * @returns {Promise<string>} JWT access token for the authenticated user
 * @throws {TApiError} If there's an error during user authentication
 */
const signInUser = async (model: z.infer<typeof signInDto>) => {
  const user = await User.findOne({ email: model.email })
    .select('+password')
    .lean()
    .exec()

  if (!user) {
    throw new ApiError('Invalid credentials', ERROR_CODE.BusinessRuleViolation)
  }

  const isMatch = await user.comparePassword(model.password)

  if (!isMatch) {
    throw new ApiError('Invalid credentials', ERROR_CODE.BusinessRuleViolation)
  }

  return generateAccessToken(user)
}

export { signInUser, signUpUser }
