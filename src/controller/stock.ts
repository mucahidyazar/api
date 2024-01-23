import { Request, Response } from 'express'
import { Server } from 'socket.io'

import { logger } from '../client'
import { Stock, MyStock } from '../model'
import { checkAllStocksRetry } from '../services/stock/helpers'

async function start(req: Request, res: Response) {
  try {
    const io = req.io
    const retry = Number(req.query.retry) || 1

    io.on('connection', (socket: Server) => {
      logger.info('connection')
      checkAllStocksRetry({
        socket,
        retry,
      })

      socket.on('disconnect', () => {
        logger.info('user disconnected')
      })
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function check(req: Request, res: Response) {
  try {
    const id = req.query.id
    const stock = await Stock.findById(id)

    if (!stock) {
      return res.status(404).json({
        message: 'stock not found',
      })
    }

    return res.status(200).json({
      message: 'stock found',
      data: {
        active: stock.active,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function stop(req: Request, res: Response) {
  try {
    const id = req.query.id
    const stock = await Stock.findById(id)

    if (!stock) {
      return res.status(404).json({
        message: 'stock not found',
      })
    }

    stock.active = false
    stock.save()

    return res.status(200).json({
      message: 'stock found',
      data: {
        active: stock.active,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function detail(req: Request, res: Response) {
  try {
    const id = req.query.id
    const stock = await Stock.findById(id)

    if (!stock) {
      return res.status(404).json({
        message: 'stock not found',
      })
    }

    return res.status(200).json({
      message: 'stock found',
      data: {
        stock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myClear(req: Request, res: Response) {
  try {
    const myStock = await MyStock.deleteMany({})
    return res.status(200).json({
      message: 'myStock deleted',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myClearResults(req: Request, res: Response) {
  try {
    const id = req.body.id
    const myStock = await MyStock.findById(id)

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found',
      })
    }

    myStock.results = []
    myStock.save()

    return res.status(200).json({
      message: 'Results of the stock is deleted',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myCreate(req: Request, res: Response) {
  try {
    const myStock = await MyStock.create({
      active: true,
      retry: 110,
    })

    checkAllStocksRetry({
      retry: myStock.retry,
      stockId: String(myStock._id),
    })

    return res.status(200).json({
      message: 'myStock started',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myStart(req: Request, res: Response) {
  try {
    const id = req.body.id
    const myStock = await MyStock.findById(id)

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found',
      })
    }

    myStock.active = true
    myStock.save()

    checkAllStocksRetry({
      retry: myStock.retry,
      stockId: String(myStock._id),
    })

    return res.status(200).json({
      message: 'myStock started',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myCheck(req: Request, res: Response) {
  try {
    const id = req.query.id
    const myStock = await MyStock.findById(id)

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found',
      })
    }

    return res.status(200).json({
      message: 'myStock found',
      data: {
        active: myStock.active,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myInit(req: Request, res: Response) {
  try {
    const myStock = await MyStock.find()

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found 1',
      })
    }

    if (myStock.length > 0) {
      myStock.forEach((stock: any) => {
        checkAllStocksRetry({
          retry: stock.retry,
          stockId: stock._id,
        })
      })
    }

    return res.status(200).json({
      message: 'myStock found',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myList(req: Request, res: Response) {
  try {
    const myStock = await MyStock.find()

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found 1',
      })
    }

    return res.status(200).json({
      message: 'myStock found',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myStop(req: Request, res: Response) {
  try {
    const id = req.body.id

    const myStop = await MyStock.findById(id)

    if (!myStop) {
      return res.status(404).json({
        message: 'myStop not found',
      })
    }

    myStop.active = false
    myStop.save()

    return res.status(200).json({
      message: 'myStop found',
      data: {
        active: myStop.active,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

async function myDetail(req: Request, res: Response) {
  try {
    const id = req.query.id
    const myStock = await MyStock.findById(id)

    if (!myStock) {
      return res.status(404).json({
        message: 'myStock not found',
      })
    }

    return res.status(200).json({
      message: 'myStock found',
      data: {
        myStock,
      },
    })
  } catch (error) {
    return res.status(500).json({
      message: 'error',
    })
  }
}

export {
  check,
  detail,
  myCheck,
  myClear,
  myClearResults,
  myCreate,
  myDetail,
  myInit,
  myList,
  myStart,
  myStop,
  start,
  stop,
}
