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
