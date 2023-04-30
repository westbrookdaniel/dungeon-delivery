import { Order } from './types'
import { getId } from './utils'

type Sub = (state: State) => void

export default class State {
  subs: Sub[] = []
  // orders
  // list of orders to be fulfilled
  // each has a location, value, and time limit
  // each order has a package
  // when you deliver to the location, you get the value
  // if you don't deliver in time, you lose the value
  // location can be 'A' or 'B'
  // value can be 1, 2, or 3
  // time limit in s
  orders: Order[] = [
    { id: getId(), location: 'A', value: 1, timeLimit: 20 },
    { id: getId(), location: 'B', value: 2, timeLimit: 30 },
    { id: getId(), location: 'A', value: 2, timeLimit: 40 },
  ]
  // score
  score = 0

  constructor() {}

  subscribe(fn: Sub) {
    this.subs.push(fn)
  }

  setScore(fn: (score: number) => number) {
    this.score = fn(this.score)
    this.subs.forEach((fn) => fn(this))
  }

  destroyOrder(id: string) {
    this.orders = this.orders.filter((order) => order.id !== id)
    this.subs.forEach((fn) => fn(this))
  }
}
