import jwt from 'jsonwebtoken';
import { User } from '../model/home-hub/user';

export const middlewareAuth = async (req, res, next) => {
  const accessToken = req.header('x-access-token');
  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, 'your_access_token_secret');
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
