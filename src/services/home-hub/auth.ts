import jwt from 'jsonwebtoken';
import { User } from '../../model/home-hub/user';

// Access token oluşturma
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, 'your_access_token_secret', {
    expiresIn: '1d',
  });
};

// Refresh token oluşturma
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, 'your_refresh_token_secret', {
    expiresIn: '7d',
  });
};

// Kullanıcı kaydı
const signUpUser = async (email, password) => {
  const user = new User({ email, password });
  const refreshToken = generateRefreshToken(user);
  await user.save();  // Kullanıcıyı kaydediyoruz ama refresh token'ı saklamıyoruz.
  const accessToken = generateAccessToken(user);
  return { accessToken, refreshToken };
};

// Kullanıcı girişi
const signInUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password'); // Password'ü sorguya dahil ediyoruz
  if (!user) {
    throw new Error('User not found');
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

// Refresh token ile yeni access token oluşturma
const refreshUserToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, 'your_refresh_token_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    return generateAccessToken(user);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export { signInUser, signUpUser, refreshUserToken };
