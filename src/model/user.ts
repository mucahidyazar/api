import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import z from 'zod'

import { DEFAULTS, VALIDATION_RULES } from '@/constants'
import { Setting } from '@/model/setting'
import { passwordSchema } from '@/validation'

import { baseSchema } from './base.model'

interface IUser extends mongoose.Document {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordChangedAt?: Date
  role: string
  avatarUrl?: string
  comparePassword(candidatePassword: string): Promise<boolean>
  defaultWallet?: string
  defaultWalletCurrency?: string
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema<IUser>({
  firstName: {
    type: String,
    maxlength: VALIDATION_RULES.input.mid,
    default: '',
  },
  lastName: {
    type: String,
    maxlength: VALIDATION_RULES.input.mid,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(email: string) {
      return z.string().email().parse(email)
    },
  },
  password: {
    type: String,
    minlength: VALIDATION_RULES.password.min,
    maxlength: VALIDATION_RULES.password.max,
    required: true,
    select: false, // Password'ü varsayılan olarak sorgularda döndürme
    validate(password: string) {
      return passwordSchema.safeParse(password).success
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatarUrl: {
    type: String,
    default: DEFAULTS.avatarUrl,
    validate(avatar: string) {
      if (avatar === '') return true
      return z.string().url().parse(avatar)
    },
  },
  defaultWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  },
  defaultWalletCurrency: {
    type: String,
  },
}).add(baseSchema)

// Parola hashleme
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.passwordChangedAt = new Date()

  if (this.isNew) {
    await Setting.create({ user: this._id })
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Parola karşılaştırma
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model<IUser>('User', userSchema)

export { IUser, User }
