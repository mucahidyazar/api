import puppeteer, {ElementHandle} from 'puppeteer'

import {
  IBrand,
  ICheckStock,
  ICheckStockRetry,
  ICheckStockResult,
} from '../../types'
import {TBrand, BRAND} from '../../constants'
import {CONFIG} from '../../config'
import {links} from '../../data'
import {getPrice, logger, sleep} from '../../utils'
import {sendTelegramMessage} from '../../client'
import {MyStock} from 'model/stock'

// export async function checkAllStocksRetry({
//   retry = 1,
//   socket,
//   shouldReturn,
//   db,
// }: {
//   retry?: number
//   socket?: any
//   shouldReturn?: boolean
//   db?: any
// }) {
//   let result: ICheckStockResult[] = []
//   const totalLinks = links.length

//   if (db) {
//     if (!db.active) {
//       logger('🛑 Stopped by user', {type: 'error'})
//       return
//     }
//   }

//   let left = retry

//   const interval = setInterval(async () => {
//     for (const link of links) {
//       const brand = link.match(/https:\/\/www\.(.*?)\./)?.[1] as TBrand
//       const response = await checkStockRetry({
//         link,
//         brandName: brand,
//         delay: CONFIG.checkStockDelay,
//       })
//       result.push(response)
//     }

//     if (socket) socket.emit('results', result)
//     if (shouldReturn) return result

//     db.results = [...db.results, ...result]
//     result.length = 0
//     left = left - 1
//     db.retry = left
//     db.save()
//     if (left === 0) {
//       clearInterval(interval)
//     }
//   }, CONFIG.checkStockDelay * (totalLinks + 1))
// }

// write an event manager
// it keep stock tracker events
// when an event starts it will be added to the event manager
// when an event ends it will be removed from the event manager
interface IEvent {
  _id: string
  active: boolean
  links: string[]
}
class EventManager {
  private events: Map<string, IEvent> = new Map()

  addEvent(event: IEvent) {
    this.events.set(event._id, event)
  }
  addEvents(events: IEvent[]) {
    this.events = new Map(events.map(event => [event._id, event]))
  }

  removeEvent(event: IEvent) {
    this.events.delete(event._id)
  }

  getEvent(event: IEvent): IEvent | undefined {
    return this.events.get(event._id)
  }

  getEvents(): IEvent[] {
    return Array.from(this.events.values().next().value)
  }

  hasEvent(event: IEvent): boolean {
    return this.events.has(event._id)
  }

  clearEvents() {
    this.events.clear()
  }

  getEventsCount(): number {
    return this.events.size
  }

  getEventIndex(event: IEvent): number {
    return Array.from(this.events.keys()).indexOf(event._id)
  }
}

export const eventManager = new EventManager()
