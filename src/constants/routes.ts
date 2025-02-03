export const ROUTES = {
  v1: {
    auth: {
      signIn: '/api/v1/auth/sign-in',
      signUp: '/api/v1/auth/sign-up',
    },
    calculation: {
      create: '/api/v1/calculation',
      delete: '/api/v1/calculation/:id([0-9a-fA-F]{24})',
      get: '/api/v1/calculation/:id([0-9a-fA-F]{24})',
      list: '/api/v1/calculation',
      update: '/api/v1/calculation/:id([0-9a-fA-F]{24})',
    },
    notification: {
      get: '/api/v1/notification/:id([0-9a-fA-F]{24})',
      list: '/api/v1/notification',
      markAsRead: '/api/v1/notification/:id([0-9a-fA-F]{24})/mark-as-read',
      markAllAsRead: '/api/v1/notification/mark-all-as-read',
      archive: '/api/v1/notification/:id([0-9a-fA-F]{24})/archive',
      archiveAll: '/api/v1/notification/archive-all',
      unreadCount: '/api/v1/notification/unread-count',
      delete: '/api/v1/notification/:id([0-9a-fA-F]{24})',
      deleteBulk: '/api/v1/notification/delete-bulk',
    },
    setting: {
      get: '/api/v1/setting',
      update: '/api/v1/setting',

      backup: '/api/v1/setting/backup',
      restore: '/api/v1/setting/restore',
      reset: '/api/v1/setting/reset',
    },
    user: {
      me: {
        get: '/api/v1/user/me',
        delete: '/api/v1/user/me',
        update: '/api/v1/user/me',
        password: {
          update: '/api/v1/user/me/password',
        },
      },

      create: '/api/v1/user',
      delete: '/api/v1/user/:id([0-9a-fA-F]{24})',
      get: '/api/v1/user/:id([0-9a-fA-F]{24})',
      list: '/api/v1/user',
      update: '/api/v1/user/:id([0-9a-fA-F]{24})',
    },
    transaction: {
      create: '/api/v1/transaction',
      delete: '/api/v1/transaction/:id([0-9a-fA-F]{24})',
      get: '/api/v1/transaction/:id([0-9a-fA-F]{24})',
      list: '/api/v1/transaction',
      update: '/api/v1/transaction/:id([0-9a-fA-F]{24})',
      chart: '/api/v1/transaction/chart',
      stats: '/api/v1/transaction/stats',
    },
    transactionBrand: {
      create: '/api/v1/transaction-brand',
      delete: '/api/v1/transaction-brand/:id([0-9a-fA-F]{24})',
      get: '/api/v1/transaction-brand/:id([0-9a-fA-F]{24})',
      list: '/api/v1/transaction-brand',
      update: '/api/v1/transaction-brand/:id([0-9a-fA-F]{24})',
    },
    transactionCategory: {
      create: '/api/v1/transaction-category',
      delete: '/api/v1/transaction-category/:id([0-9a-fA-F]{24})',
      get: '/api/v1/transaction-category/:id([0-9a-fA-F]{24})',
      list: '/api/v1/transaction-category',
      update: '/api/v1/transaction-category/:id([0-9a-fA-F]{24})',
    },
    wallet: {
      create: '/api/v1/wallet',
      delete: '/api/v1/wallet/:id([0-9a-fA-F]{24})',
      get: '/api/v1/wallet/:id([0-9a-fA-F]{24})',
      list: '/api/v1/wallet',
      update: '/api/v1/wallet/:id([0-9a-fA-F]{24})',

      accessor: {
        create: '/api/v1/wallet/:id([0-9a-fA-F]{24})/accessor',
        delete:
          '/api/v1/wallet/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
        update:
          '/api/v1/wallet/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
      },
      transaction: {
        list: '/api/v1/wallet/:id([0-9a-fA-F]{24})/transaction',
      },

      type: {
        list: '/api/v1/wallet-type',
      },
    },
    wishlist: {
      create: '/api/v1/wishlist',
      delete: '/api/v1/wishlist/:id([0-9a-fA-F]{24})',
      get: '/api/v1/wishlist/:id([0-9a-fA-F]{24})',
      list: '/api/v1/wishlist',
      update: '/api/v1/wishlist/:id([0-9a-fA-F]{24})',

      item: {
        update:
          '/api/v1/wishlist/:id([0-9a-fA-F]{24})/item/:itemId([0-9a-fA-F]{24})',
      },
      accessor: {
        create: '/api/v1/wishlist/:id([0-9a-fA-F]{24})/accessor',
        update:
          '/api/v1/wishlist/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
        delete:
          '/api/v1/wishlist/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
      },
    },
    pushToken: {
      create: '/api/v1/push-token',
    },
  },
}
