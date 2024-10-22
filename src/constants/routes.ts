export const ROUTES = {
  v1: {
    homeHub: {
      auth: {
        signIn: '/api/v1/home-hub/auth/sign-in',
        signOut: '/api/v1/home-hub/auth/sign-out',
        signUp: '/api/v1/home-hub/auth/sign-up',
        refreshToken: '/api/v1/home-hub/auth/refresh-token',
      },
      user: {
        me: '/api/v1/home-hub/user/me',
        create: '/api/v1/home-hub/user',
        delete: '/api/v1/home-hub/user/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/user/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/user',
        update: '/api/v1/home-hub/user/:id([0-9a-fA-F]{24})',
      },
      group: {
        create: '/api/v1/home-hub/group',
        delete: '/api/v1/home-hub/group/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/group/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/group',
        update: '/api/v1/home-hub/group/:id([0-9a-fA-F]{24})',

        invite: {
          answer: '/api/v1/home-hub/group/:id([0-9a-fA-F]{24})/invite/answer',
          list: '/api/v1/home-hub/group/invite',
          send: '/api/v1/home-hub/group/:id([0-9a-fA-F]{24})/invite/send',
        }
      },
      transaction: {
        create: '/api/v1/home-hub/transaction',
        delete: '/api/v1/home-hub/transaction/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/transaction/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/transaction',
        update: '/api/v1/home-hub/transaction/:id([0-9a-fA-F]{24})',
        chart: '/api/v1/home-hub/transaction/chart',
      },
      transactionBrand: {
        create: '/api/v1/home-hub/transaction-brand',
        delete: '/api/v1/home-hub/transaction-brand/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/transaction-brand/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/transaction-brand',
        update: '/api/v1/home-hub/transaction-brand/:id([0-9a-fA-F]{24})',
      },
      transactionCategory: {
        create: '/api/v1/home-hub/transaction-category',
        delete: '/api/v1/home-hub/transaction-category/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/transaction-category/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/transaction-category',
        update: '/api/v1/home-hub/transaction-category/:id([0-9a-fA-F]{24})',
      },
      wallet: {
        create: '/api/v1/home-hub/wallet',
        delete: '/api/v1/home-hub/wallet/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/wallet/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/wallet',
        update: '/api/v1/home-hub/wallet/:id([0-9a-fA-F]{24})',

        transactions: {
          list: '/api/v1/home-hub/wallet/:id([0-9a-fA-F]{24})/transactions',
        }
      },
      walletBalance: {
        create: '/api/v1/home-hub/wallet-balance',
        delete: '/api/v1/home-hub/wallet-balance/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/wallet-balance/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/wallet-balance',
        update: '/api/v1/home-hub/wallet-balance/update',
      },
      walletType: {
        create: '/api/v1/home-hub/wallet-type',
        delete: '/api/v1/home-hub/wallet-type/:id([0-9a-fA-F]{24})',
        get: '/api/v1/home-hub/wallet-type/:id([0-9a-fA-F]{24})',
        list: '/api/v1/home-hub/wallet-type',
        update: '/api/v1/home-hub/wallet-type/update',
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
