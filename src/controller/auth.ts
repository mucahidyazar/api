import { Request, Response } from 'express'

import { TSignInDto, TSignUpDto } from '@/model/request/auth.dto'
import { signUpUser, signInUser } from '@/services/auth'
import { ApiResponse } from '@/utils'

/**
 * Authentication controller handling user sign-up and sign-in operations
 */

/**
 * Creates a new user account
 * @route POST /api/v1/auth/sign-up
 * @access Public
 * @returns {object} 201 - User created successfully
 * @returns {string} accessToken - JWT token for authentication
 * @throws {400} - Invalid input data
 * @throws {409} - Email already exists
 */
async function signUp(req: Request, res: Response) {
  const signUpModel: TSignUpDto = req.body
  const accessToken: string = await signUpUser(signUpModel)

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success({ accessToken }),
  })
}

/**
 * Authenticates an existing user
 * @route POST /api/v1/auth/sign-in
 * @access Public
 * @returns {object} 200 - Authentication successful
 * @returns {string} accessToken - JWT token for authentication
 * @throws {401} - Invalid credentials
 * @throws {404} - User not found
 */
async function signIn(req: Request, res: Response) {
  const signInModel: TSignInDto = req.body
  const accessToken = await signInUser(signInModel)

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success({ accessToken }),
  })
}

export { signIn, signUp }
