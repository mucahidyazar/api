import jwt from 'jsonwebtoken';
import { User } from '../model/lumara/user';

export const middlewareAuth = async (req, res, next) => {
  const accessToken = req.header('x-access-token');
  if (!accessToken) {
    return res.response({
      status: 'error',
      code: 401,
      message: 'No token provided',
    });
  }

  const decoded = jwt.verify(accessToken, 'your_access_token_secret');
  req.user = await User.findById(decoded.id);
  next();
};
