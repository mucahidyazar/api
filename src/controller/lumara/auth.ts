import { Request, Response } from 'express';

import { signUpUser, signInUser } from '@/services/lumara/auth';

async function signUp(req: Request, res: Response) {
  const { email, password } = req.body;
  const tokens = await signUpUser(email, password);

  return res.response({
    status: 'success',
    code: 201,
    message: 'User signed up successfully',
    data: { accessToken: tokens.accessToken }
  })

}

async function signIn(req: Request, res: Response) {
  const { email, password } = req.body;
  const tokens = await signInUser(email, password);

  return res.response({
    status: 'success',
    code: 200,
    message: 'User signed in successfully',
    data: { accessToken: tokens.accessToken }
  })

}


export { signIn, signUp };
