export * from './auth'
export * from './calculation'
export * from './notification'
export * from './push-token'
export * from './setting'
export * from './transaction'
export * from './transaction-brand'
export * from './transaction-category'
export * from './user'
export * from './wallet'
export * from './wishlist'

// here in every file we are exporting the openApiPaths object here we are importing all the openApiPaths object from all the files and merging them into one object and exporting it
import { authOpenApiPaths } from './auth'
// import { calcOpenApiPaths } from './calculation'
// import { notificationOpenApiPaths } from './notification'
// import { pushTokenOpenApiPaths } from './push-token'
// import { settingOpenApiPaths } from './setting'
// import { transactionOpenApiPaths } from './transaction'
// import { transactionBrandOpenApiPaths } from './transaction-brand'
// import { transactionCategoryOpenApiPaths } from './transaction-category'
// import { userOpenApiPaths } from './user'
// import { walletOpenApiPaths } from './wallet'
// import { wishlistOpenApiPaths } from './wishlist'

const openApiPaths = {
  ...authOpenApiPaths,
  // ...calcOpenApiPaths,
  // ...notificationOpenApiPaths,
  // ...pushTokenOpenApiPaths,
  // ...settingOpenApiPaths,
  // ...transactionOpenApiPaths,
  // ...transactionBrandOpenApiPaths,
  // ...transactionCategoryOpenApiPaths,
  // ...userOpenApiPaths,
  // ...walletOpenApiPaths,
  // ...wishlistOpenApiPaths,
}
export default openApiPaths

const openApiTags = {
  authentication: 'Authentication',
  calculation: 'Calculation',
  notification: 'Notification',
  pushToken: 'Push Token',
  setting: 'Setting',
  transaction: 'Transaction',
  transactionBrand: 'Transaction Brand',
  transactionCategory: 'Transaction Category',
  user: 'User',
  wallet: 'Wallet',
  wishlist: 'Wishlist',
}

export { openApiTags }
