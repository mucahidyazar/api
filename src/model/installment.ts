import mongoose from 'mongoose'

import { IBaseTransaction, baseTransactionSchema } from './transaction-base'

interface IInstallment extends mongoose.Document, IBaseTransaction {
  status: 'continuing' | 'completed' | 'canceled' | 'deleted'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  repeat: number
  autoRenew: boolean
  totalAmount: number
  startDate: Date
  endDate: Date

  remainingAmount: number
  getRemainingAmount(): Promise<number>

  paidAmount: number
  getPaidAmount(): Promise<number>

  remainingPayments: number
  getRemainingPayments(): Promise<number>

  completedPayments: number
  getCompletedPayments(): Promise<number>

  getActiveInstallments(userId: string): Promise<IInstallment[]>

  cancelInstallment(): Promise<IInstallment>

  progress: {
    percentage: number
    completedPayments: number
    totalPayments: number
  }
  getProgress(): Promise<{
    percentage: number
    completedPayments: number
    totalPayments: number
  }>

  summary: {
    id: mongoose.Types.ObjectId
    description: string
    amount: number
    totalAmount: number
    startDate: Date
    endDate: Date
    remainingAmount: number
    paidAmount: number
    remainingPayments: number
    completedPayments: number
    progress: {
      percentage: number
      completedPayments: number
      totalPayments: number
    }
  }
  getSummary(): Promise<{
    id: mongoose.Types.ObjectId
    description: string
    amount: number
    totalAmount: number
    startDate: Date
    endDate: Date
    remainingAmount: number
    paidAmount: number
    remainingPayments: number
    completedPayments: number
    progress: {
      percentage: number
      completedPayments: number
      totalPayments: number
    }
  }>
}

const installmentSchema = new mongoose.Schema({
  ...baseTransactionSchema.obj,

  status: {
    type: String,
    describe: 'Status of the installment',
    enum: ['continuing', 'completed', 'canceled', 'deleted'],
    required: true,
    default: 'continuing',
  },

  frequency: {
    type: String,
    describe: 'Frequency of the installment',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    default: 'monthly',
  },

  repeat: {
    type: Number,
    describe: 'Number of times to repeat the installment',
    required: true,
    default: 1,
  },

  totalAmount: {
    type: Number,
    describe: 'Total amount of the installment',
    required: true,
    default: 0,
  },

  startDate: {
    type: Date,
    describe: 'Start date of the installment',
    required: true,
  },
  endDate: {
    type: Date,
    describe: 'End date of the installment',
    required: true,
  },
})

/**
 * Get the remaining amount of the subscription
 * @returns {number} Remaining amount of the subscription
 * @async
 */
installmentSchema.methods.getRemainingAmount = async function () {
  if (this.repeat === 1) {
    return this.totalAmount - this.amount
  }

  const now = new Date()

  if (now > this.endDate) {
    return 0
  }

  // Calculate elapsed time based on frequency
  let elapsedPeriods = 0
  switch (this.frequency) {
    case 'daily':
      elapsedPeriods = Math.floor(
        (now.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      break
    case 'weekly':
      elapsedPeriods = Math.floor(
        (now.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
      )
      break
    case 'monthly':
      elapsedPeriods =
        (now.getFullYear() - this.startDate.getFullYear()) * 12 +
        (now.getMonth() - this.startDate.getMonth())
      break
    case 'yearly':
      elapsedPeriods = now.getFullYear() - this.startDate.getFullYear()
      break
  }

  // Cap elapsed periods to total repeat count
  elapsedPeriods = Math.min(elapsedPeriods, this.repeat)

  // Calculate amount per period
  const amountPerPeriod = this.totalAmount / this.repeat

  // Calculate remaining periods and amount
  const remainingPeriods = this.repeat - elapsedPeriods
  return amountPerPeriod * remainingPeriods
}

/**
 * Get the remaining amount of the subscription
 * @returns {number} Remaining amount of the subscription
 * @async
 */
installmentSchema.virtual('remainingAmount').get(async function (
  this: IInstallment,
) {
  return await this.getRemainingAmount()
})

/**
 * Get the paid amount of the subscription
 * @returns {number} Paid amount of the subscription
 * @async
 */
installmentSchema.methods.getPaidAmount = async function () {
  return this.totalAmount - (await this.getRemainingAmount())
}

/**
 * Get the paid amount of the subscription
 * @returns {number} Paid amount of the subscription
 * @async
 */
installmentSchema.virtual('paidAmount').get(async function (
  this: IInstallment,
) {
  return await this.getPaidAmount()
})

/**
 * Get the remaining payments of the subscription
 * @returns {number} Remaining payments of the subscription
 * @async
 */
installmentSchema.methods.getRemainingPayments = async function () {
  const remainingAmount = await this.getRemainingAmount()
  return Math.ceil(remainingAmount / this.amount)
}

/**
 * Get the remaining payments of the subscription
 * @returns {number} Remaining payments of the subscription
 * @async
 */
installmentSchema.virtual('remainingPayments').get(async function (
  this: IInstallment,
) {
  return await this.getRemainingPayments()
})

/**
 * Get the completed payments of the subscription
 * @returns {number} Completed payments of the subscription
 * @async
 */
installmentSchema.methods.getCompletedPayments = async function () {
  const remainingAmount = await this.getRemainingAmount()
  return Math.floor((this.totalAmount - remainingAmount) / this.amount)
}

/**
 * Get the completed payments of the subscription
 * @returns {number} Completed payments of the subscription
 * @async
 */
installmentSchema.virtual('completedPayments').get(async function (
  this: IInstallment,
) {
  return await this.getCompletedPayments()
})

installmentSchema.statics.getActiveInstallments = async function (
  userId: string,
) {
  return this.find({
    user: new mongoose.Types.ObjectId(userId),
    status: 'continuing',
    endDate: { $gte: new Date() },
  }).sort({ startDate: -1 })
}

installmentSchema.methods.cancelInstallment = async function () {
  this.status = 'canceled'
  this.endDate = new Date()
  return await this.save()
}

installmentSchema.methods.getProgress = async function () {
  const completed = await this.getCompletedPayments()
  return {
    percentage: (completed / this.repeat) * 100,
    completedPayments: completed,
    totalPayments: this.repeat,
  }
}

installmentSchema.virtual('progress').get(async function (this: IInstallment) {
  return await this.getProgress()
})

installmentSchema.statics.getExpiringInstallments = async function (
  daysThreshold: number,
) {
  const now = new Date()
  const thresholdDate = new Date(
    now.getTime() + daysThreshold * 24 * 60 * 60 * 1000,
  )

  return this.find({
    status: 'continuing',
    endDate: {
      $gte: now,
      $lte: thresholdDate,
    },
  })
}

installmentSchema.methods.getSummary = async function () {
  return {
    id: this._id,
    description: this.description,
    amount: this.amount,
    totalAmount: this.totalAmount,
    startDate: this.startDate,
    endDate: this.endDate,
    remainingAmount: await this.getRemainingAmount(),
    paidAmount: await this.getPaidAmount(),
    remainingPayments: await this.getRemainingPayments(),
    completedPayments: await this.getCompletedPayments(),
    progress: await this.getProgress(),
  }
}

installmentSchema.virtual('summary').get(async function (this: IInstallment) {
  return await this.getSummary()
})

const Installment = mongoose.model<IInstallment>(
  'Installment',
  installmentSchema,
)

export { IInstallment, Installment }
