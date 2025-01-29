import jwt from 'jsonwebtoken';
import { User } from '../model/lumara/user';
import { ApiError } from '@/services/api-error';

export const middlewareAuth = async (req, res, next) => {
  const accessToken = req.header('x-access-token');
  if (!accessToken) {
    return res.response({
      status: 'error',
      code: 401,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(accessToken, 'your_access_token_secret');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.response({
      status: 'error',
      code: 401,
      message: 'Unauthorized',
    });
  }
};
