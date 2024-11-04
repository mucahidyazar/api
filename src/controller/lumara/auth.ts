import { Request, Response } from 'express';
import { signUpUser, signInUser, refreshUserToken } from '../../services/lumara/auth';

async function signUp(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const tokens = await signUpUser(email, password);

    // Refresh token'ı HTTP-only cookie'de sakla
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS üzerinde secure flag
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    return res.response({
      status: 'success',
      code: 201,
      message: 'User signed up successfully',
      data: { accessToken: tokens.accessToken }
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    })
  }
}

async function signIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const tokens = await signInUser(email, password);

    // Refresh token'ı HTTP-only cookie'de sakla
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'User signed in successfully',
      data: { accessToken: tokens.accessToken }
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    })
  }
}

async function signOut(req: Request, res: Response) {
  try {
    // Refresh token cookie'sini sil
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    return res.response({
      status: 'success',
      code: 200,
      message: 'User signed out successfully',
      data: {}
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    })
  }
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.response({
      status: 'error',
      code: 401,
      message: 'No refresh token provided'
    })
  }

  try {
    const newAccessToken = await refreshUserToken(refreshToken);
    return res.response({
      status: 'success',
      code: 200,
      message: 'Access token refreshed successfully',
      data: { accessToken: newAccessToken }
    })
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 401,
      message: error.message,
      details: error,
    })
  }
}

export { signIn, signUp, signOut, refreshToken };
