export const ROUTES = {
  v1: {
    lumara: {
      auth: {
        signIn: '/api/v1/lumara/auth/sign-in',
        signOut: '/api/v1/lumara/auth/sign-out',
        signUp: '/api/v1/lumara/auth/sign-up',
        refreshToken: '/api/v1/lumara/auth/refresh-token',
      },
      calculation: {
        create: '/api/v1/lumara/calculation',
        delete: '/api/v1/lumara/calculation/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/calculation/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/calculation',
        update: '/api/v1/lumara/calculation/:id([0-9a-fA-F]{24})',
      },
      notification: {
        get: '/api/v1/lumara/notification/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/notification',
        markAsRead: '/api/v1/lumara/notification/:id([0-9a-fA-F]{24})/mark-as-read',
        markAllAsRead: '/api/v1/lumara/notification/mark-all-as-read',
        archive: '/api/v1/lumara/notification/:id([0-9a-fA-F]{24})/archive',
        archiveAll: '/api/v1/lumara/notification/archive-all',
        unreadCount: '/api/v1/lumara/notification/unread-count',
        delete: '/api/v1/lumara/notification/:id([0-9a-fA-F]{24})',
        deleteBulk: '/api/v1/lumara/notification/delete-bulk',
      },
      setting: {
        get: '/api/v1/lumara/setting',
        update: '/api/v1/lumara/setting',

        backup: '/api/v1/lumara/setting/backup',
        restore: '/api/v1/lumara/setting/restore',
        reset: '/api/v1/lumara/setting/reset',
      },
      user: {
        me: {
          get: '/api/v1/lumara/user/me',
          delete: '/api/v1/lumara/user/me',
          update: '/api/v1/lumara/user/me',
          password: {
            update: '/api/v1/lumara/user/me/password'
          },
        },

        create: '/api/v1/lumara/user',
        delete: '/api/v1/lumara/user/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/user/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/user',
        update: '/api/v1/lumara/user/:id([0-9a-fA-F]{24})',
      },
      transaction: {
        create: '/api/v1/lumara/transaction',
        delete: '/api/v1/lumara/transaction/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/transaction/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/transaction',
        update: '/api/v1/lumara/transaction/:id([0-9a-fA-F]{24})',
        chart: '/api/v1/lumara/transaction/chart',
        stats: '/api/v1/lumara/transaction/stats',
      },
      transactionBrand: {
        create: '/api/v1/lumara/transaction-brand',
        delete: '/api/v1/lumara/transaction-brand/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/transaction-brand/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/transaction-brand',
        update: '/api/v1/lumara/transaction-brand/:id([0-9a-fA-F]{24})',
      },
      transactionCategory: {
        create: '/api/v1/lumara/transaction-category',
        delete: '/api/v1/lumara/transaction-category/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/transaction-category/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/transaction-category',
        update: '/api/v1/lumara/transaction-category/:id([0-9a-fA-F]{24})',
      },
      wallet: {
        create: '/api/v1/lumara/wallet',
        delete: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/wallet',
        update: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})',

        accessor: {
          create: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})/accessor',
          delete: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
        },
        transaction: {
          list: '/api/v1/lumara/wallet/:id([0-9a-fA-F]{24})/transaction',
        }
      },
      walletBalance: {
        create: '/api/v1/lumara/wallet-balance',
        delete: '/api/v1/lumara/wallet-balance/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/wallet-balance/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/wallet-balance',
        update: '/api/v1/lumara/wallet-balance/update',
      },
      walletType: {
        create: '/api/v1/lumara/wallet-type',
        delete: '/api/v1/lumara/wallet-type/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/wallet-type/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/wallet-type',
        update: '/api/v1/lumara/wallet-type/update',
      },
      wishlist: {
        create: '/api/v1/lumara/wishlist',
        delete: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})',
        get: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})',
        list: '/api/v1/lumara/wishlist',
        update: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})',

        item: {
          update: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})/item/:itemId([0-9a-fA-F]{24})',
        },
        accessor: {
          create: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})/accessor',
          delete: '/api/v1/lumara/wishlist/:id([0-9a-fA-F]{24})/accessor/:accessorId([0-9a-fA-F]{24})',
        },
      },
      pushToken: {
        create: '/api/v1/lumara/push-token',
      },
    },
    stock: {
      start: '/api/v1/stock/start',
      check: '/api/v1/stock/check',
      stop: '/api/v1/stock/stop',
      detail: '/api/v1/stock/detail',
      myInit: '/api/v1/stock/my-init',
      myStart: '/api/v1/stock/my-start',
      myCheck: '/api/v1/stock/my-check',
      myClear: '/api/v1/stock/my-clear',
      myClearResults: '/api/v1/stock/my-clear-results',
      myCreate: '/api/v1/stock/my-create',
      myList: '/api/v1/stock/my-list',
      myStop: '/api/v1/stock/my-stop',
      myDetail: '/api/v1/stock/my-detail',
    },
    wishList: {
      list: '/api/v1/wish-list',
      connect: '/api/v1/wish-list/connect',
      create: '/api/v1/wish-list',
      get: '/api/v1/wish-list/:id([0-9a-fA-F]{24})',
      delete: '/api/v1/wish-list/:id([0-9a-fA-F]{24})',
    },
    socket: {
      start: '/api/v1/socket/start',
    },
    linkPreview: {
      linkPreview: '/api/v1/link-preview',
    },
    urlShortener: {
      create: '/api/v1/url-shortener',
      open: '/api/v1/url-shortener/open',
      list: '/api/v1/url-shortener/:id([0-9a-fA-F]{24})',
      get: '/api/v1/url-shortener/:id([0-9a-fA-F]{24})/:id([0-9a-fA-F]{24})',
      delete: '/api/v1/url-shortener/:id([0-9a-fA-F]{24})/:id([0-9a-fA-F]{24})',
    },
  },
}
