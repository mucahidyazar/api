import mongoose from 'mongoose'

import { ITransaction } from './transaction'
import { IBaseTransaction, baseTransactionSchema } from './transaction-base'

interface ISubscription extends IBaseTransaction {
  subscriptionStatus: 'continuing' | 'completed' | 'canceled' | 'deleted'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  repeat: number
  autoRenew: boolean
  totalAmount: number
  startDate: Date
  endDate: Date

  transactions: mongoose.Types.ObjectId[] | ITransaction['_id'][]

  nextPaymentDate: Date
  getNextPaymentDate(): Promise<Date>

  nextRenewalDate: Date
  getNextRenewalDate(): Promise<Date>

  remainingAmount: number
  getRemainingAmount(): Promise<number>

  paidAmount: number
  getPaidAmount(): Promise<number>

  remainingPayments: number
  getRemainingPayments(): Promise<number>

  completedPayments: number
  getCompletedPayments(): Promise<number>

  cancelSubscription(): Promise<ISubscription>

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

  getExpiringSubscriptions(daysThreshold: number): Promise<ISubscription[]>

  summary: {
    frequency: string
    totalAmount: number
    remainingAmount: number
    paidAmount: number
    completedPayments: number
    remainingPayments: number
    isAutoRenew: boolean
    status: string
  }
  getSummary(): Promise<{
    frequency: string
    totalAmount: number
    remainingAmount: number
    paidAmount: number
    completedPayments: number
    remainingPayments: number
    isAutoRenew: boolean
    status: string
  }>
}

const subscriptionSchema = new mongoose.Schema({
  subscriptionStatus: {
    type: String,
    describe: 'Status of the subscription',
    enum: ['continuing', 'completed', 'canceled', 'deleted'],
    required: true,
    default: 'continuing',
  },

  frequency: {
    type: String,
    describe: 'Frequency of the subscription',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
    default: 'monthly',
  },

  repeat: {
    type: Number,
    describe: 'Number of times to repeat the subscription',
    required: true,
    default: 1,
  },

  autoRenew: {
    type: Boolean,
    describe: 'Auto renew the subscription',
    required: true,
    default: false,
  },

  totalAmount: {
    type: Number,
    describe: 'Total amount of the subscription',
    required: true,
    default: 0,
  },

  startDate: {
    type: Date,
    describe: 'Start date of the subscription',
    required: true,
  },
  endDate: {
    type: Date,
    describe: 'End date of the subscription',
  },
}).add(baseTransactionSchema)

subscriptionSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'parent',
  justOne: false,
})

/**
 * Get the next renewal date of the subscription
 * @returns {Date} Next renewal date of the subscription
 * @async
 */
subscriptionSchema.methods.getNextRenewalDate = async function () {
  if (this.status !== 'continuing' || !this.autoRenew) {
    return null
  }

  const now = new Date()

  if (this.endDate && now > this.endDate) {
    return null
  }

  const nextRenewalDate = new Date(this.startDate)
  switch (this.frequency) {
    case 'daily':
      nextRenewalDate.setDate(nextRenewalDate.getDate() + this.repeat)
      break
    case 'weekly':
      nextRenewalDate.setDate(nextRenewalDate.getDate() + this.repeat * 7)
      break
    case 'monthly':
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + this.repeat)
      break
    case 'yearly':
      nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + this.repeat)
      break
  }

  return nextRenewalDate
}

/**
 * Get the next renewal date of the subscription
 * @returns {Date} Next renewal date of the subscription
 * @async
 */
subscriptionSchema.virtual('nextRenewalDate').get(async function (
  this: ISubscription,
) {
  return await this.getNextRenewalDate()
})

/**
 * Get the next Payment date of the subscription
 * @returns {Date} Next Payment date of the subscription
 * @async
 */
subscriptionSchema.methods.getNextPaymentDate = async function () {
  if (this.status !== 'continuing') {
    return null
  }

  const now = new Date()

  if (this.startDate > now) {
    return this.startDate
  }

  if (this.endDate && now > this.endDate) {
    return null
  }

  const nextPaymentDate = new Date(this.startDate)
  switch (this.frequency) {
    case 'daily':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + this.repeat)
      break
    case 'weekly':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + this.repeat * 7)
      break
    case 'monthly':
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + this.repeat)
      break
    case 'yearly':
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + this.repeat)
      break
  }

  return nextPaymentDate
}
/**
 * Get the next payment date of the subscription
 * @returns {Date} Next payment date of the subscription
 * @async
 */
subscriptionSchema.virtual('nextPaymentDate').get(async function (
  this: ISubscription,
) {
  return await this.getNextPaymentDate()
})

/**
 * Get the remaining amount of the subscription
 * @returns {number} Remaining amount of the subscription
 * @async
 */
subscriptionSchema.methods.getRemainingAmount = async function () {
  if (this.repeat === 1) {
    return this.totalAmount - this.amount
  }

  const now = new Date()

  if (this.startDate > now) {
    return this.totalAmount
  }

  if ((this.endDate && now > this.endDate) || this.status !== 'continuing') {
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
subscriptionSchema.virtual('remainingAmount').get(async function (
  this: ISubscription,
) {
  return await this.getRemainingAmount()
})

/**
 * Get the paid amount of the subscription
 * @returns {number} Paid amount of the subscription
 * @async
 */
subscriptionSchema.methods.getPaidAmount = async function () {
  if (this.startDate > new Date()) {
    return 0
  }

  return this.totalAmount - (await this.getRemainingAmount())
}

/**
 * Get the paid amount of the subscription
 * @returns {number} Paid amount of the subscription
 * @async
 */
subscriptionSchema.methods.getRemainingPayments = async function () {
  if (this.startDate > new Date()) {
    return this.repeat
  }

  const remainingAmount = await this.getRemainingAmount()
  return Math.ceil(remainingAmount / this.amount)
}

/**
 * Get the remaining amount of the subscription
 * @returns {number} Remaining amount of the subscription
 * @async
 */
subscriptionSchema.virtual('remainingPayments').get(async function (
  this: ISubscription,
) {
  return await this.getRemainingPayments()
})

/**
 * Get the completed payments of the subscription
 * @returns {number} Completed payments of the subscription
 * @async
 */
subscriptionSchema.methods.getCompletedPayments = async function () {
  if (this.startDate > new Date()) {
    return 0
  }

  const remainingAmount = await this.getRemainingAmount()
  return Math.floor((this.totalAmount - remainingAmount) / this.amount)
}

/**
 * Get the completed payments of the subscription
 * @returns {number} Completed payments of the subscription
 * @async
 */
subscriptionSchema.virtual('completedPayments').get(async function (
  this: ISubscription,
) {
  return await this.getCompletedPayments()
})

subscriptionSchema.statics.getActiveSubscriptions = async function (
  userId: string,
) {
  return this.find({
    user: userId,
    status: 'continuing',
    endDate: { $gt: new Date() },
  }).sort({ startDate: -1 })
}

subscriptionSchema.methods.cancelSubscription = async function () {
  this.status = 'canceled'
  this.endDate = new Date()
  this.autoRenew = false
  return this.save()
}

subscriptionSchema.methods.getProgress = async function () {
  const completed = await this.getCompletedPayments()
  return {
    percentage: (completed / this.repeat) * 100,
    completedPayments: completed,
    totalPayments: this.repeat,
  }
}

subscriptionSchema.virtual('progress').get(async function (
  this: ISubscription,
) {
  return await this.getProgress()
})

subscriptionSchema.statics.getExpiringSubscriptions = async function (
  daysThreshold: number = 7,
) {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return this.find({
    status: 'continuing',
    endDate: {
      $gte: new Date(),
      $lte: thresholdDate,
    },
  })
}

subscriptionSchema.methods.getSummary = async function () {
  const [remaining, completed] = await Promise.all([
    this.getRemainingAmount(),
    this.getCompletedPayments(),
  ])

  return {
    frequency: this.frequency,
    totalAmount: this.totalAmount,
    remainingAmount: remaining,
    paidAmount: this.totalAmount - remaining,
    completedPayments: completed,
    remainingPayments: this.repeat - completed,
    isAutoRenew: this.autoRenew,
    status: this.status,
  }
}

subscriptionSchema.virtual('summary').get(async function (this: ISubscription) {
  return await this.getSummary()
})

const Subscription = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema,
)

export { ISubscription, Subscription }
