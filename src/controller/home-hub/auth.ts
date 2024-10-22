import { Request, Response } from 'express';
import { signUpUser, signInUser, refreshUserToken } from '../../services/home-hub/auth';

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

    res.json({ accessToken: tokens.accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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

    res.json({ accessToken: tokens.accessToken });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function signOut(req: Request, res: Response) {
  try {
    // Refresh token cookie'sini sil
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

    res.json({ message: 'User signed out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const newAccessToken = await refreshUserToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}

export { signIn, signUp, signOut, refreshToken };
