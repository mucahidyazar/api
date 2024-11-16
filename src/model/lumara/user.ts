import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import z from 'zod';

import { Setting } from './setting';

interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role: string;
  avatarUrl?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  defaultWallet?: string;
  defaultWalletCurrency?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      maxlength: 50,
      default: '',
    },
    lastName: {
      type: String,
      maxlength: 50,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(email: string) {
        return z.string().email().parse(email);
      },
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 100,
      required: true,
      select: false, // Password'ü varsayılan olarak sorgularda döndürme
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
      default: 'https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg',
      validate(avatar: string) {
        if (avatar === '') return true;
        return z.string().url().parse(avatar);
      },
    },
    defaultWallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    defaultWalletCurrency: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

// Parola hashleme
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.passwordChangedAt = new Date();

  if (this.isNew) {
    await Setting.create({ user: this._id });
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parola karşılaştırma
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export { User };
