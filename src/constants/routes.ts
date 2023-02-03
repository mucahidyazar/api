export const ROUTES = {
  v1: {
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
    socket: {
      start: '/api/v1/socket/start',
    },
    linkPreview: {
      linkPreview: '/api/v1/link-preview',
    },
    urlShortener: {
      create: '/api/v1/url-shortener/create',
      open: '/api/v1/url-shortener/open',
      list: '/api/v1/url-shortener/get',
      get: '/api/v1/url-shortener/get/:id',
      delete: '/api/v1/url-shortener/delete/:id',
    },
  },
}
