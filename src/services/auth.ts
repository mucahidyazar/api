import jwt from 'jsonwebtoken'

import { User } from '@/model/user'

// Access token oluşturma
const generateAccessToken = user => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    'your_access_token_secret',
    {
      expiresIn: '1d',
    },
  )
}

// Kullanıcı kaydı
const signUpUser = async (email, password) => {
  const user = new User({ email, password })
  await user.save() // Kullanıcıyı kaydediyoruz ama refresh token'ı saklamıyoruz.
  const accessToken = generateAccessToken(user)
  return { accessToken }
}

// Kullanıcı girişi
const signInUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password') // Password'ü sorguya dahil ediyoruz
  if (!user) {
    throw new Error('User not found')
  }
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new Error('Invalid credentials')
  }
  const accessToken = generateAccessToken(user)
  return { accessToken }
}

export { signInUser, signUpUser }
