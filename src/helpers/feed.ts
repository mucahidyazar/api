import { Transaction } from '../model/lumara/transaction'
import { TransactionBrand } from '../model/lumara/transaction-brand'
import { TransactionCategory } from '../model/lumara/transaction-category'
import { TransactionValue } from '../model/lumara/transaction-value'
import { User } from '../model/lumara/user'

import { brands } from '../constants/brands'
import { categories } from '../constants/categories'
import { toCamelCase } from '../utils/string'

import '../config/db'
import { getRandomPastelColor } from './color'
import { generateRandomDate } from './date'
import { getRandomNumber } from './number'

const ADMIN_EMAIL = 'admin@mucahid.dev'
const ADMIN_PASSWORD = 'XasdQWE123'
const ME_ID = '670f54b3b41dbe2a9abaa048'
const ME_WALLET_ID = '6714b60e28612cd04ac44467'
const ME_WALLET_BALANCE_ID = '6714b62828612cd04ac444ae'

async function feed() {
  let adminUser = await User.findOne({
    email: ADMIN_EMAIL,
  })

  if (!adminUser) {
    adminUser = await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
  }
  console.info(`User ${adminUser.email} is created`)

  const brandsData = brands.map(b => ({
    name: toCamelCase(b.id),
    usageCount: 0,
    user: adminUser.id,
  }))

  const categoriesData = categories.map(c => ({
    name: toCamelCase(c.id),
    usageCount: 0,
    user: adminUser.id,
    icon: c.icon,
    color: getRandomPastelColor()
  }))

  await TransactionBrand.insertMany(brandsData)
  console.info('Brands are fed')
  const allTransactionCategories = await TransactionCategory.insertMany(categoriesData)
  console.info('Categories are fed')


  const transactionsValuesMap = allTransactionCategories.map(t => ({
    amount: getRandomNumber({ min: 10, max: 50 }),
    currency: "USD"
  }))

  const transactionsValues = await TransactionValue.insertMany(transactionsValuesMap);

  const transactions = allTransactionCategories.map((t, index) => ({
    type: "expense",
    date: generateRandomDate({ minYear: 2015, maxYear: 2023 }),
    user: ME_ID,
    wallet: ME_WALLET_ID,
    walletBalance: ME_WALLET_BALANCE_ID,
    transactionCategory: allTransactionCategories[index].id,
    transactionValue: transactionsValues[index].id,
  }))

  await Transaction.insertMany(transactions)

  const recurringTransactionsMap = [
    "daily",
    "daily",
    "daily",
    "weekly",
    "weekly",
    "monthly",
    "monthly",
    "monthly",
    "monthly",
    "yearly",
    "yearly",
    "yearly",
    "yearly"
  ].map((r, i) => ({
    type: "expense",
    date: generateRandomDate({ minYear: 2015, maxYear: 2023 }),
    user: ME_ID,
    wallet: ME_WALLET_ID,
    walletBalance: ME_WALLET_BALANCE_ID,
    transactionCategory: allTransactionCategories[i].id,
    transactionValue: transactionsValues[i].id,
    recurringType: r,
    isRecurring: true,
  }))

  await Transaction.insertMany(recurringTransactionsMap)
}

feed()
