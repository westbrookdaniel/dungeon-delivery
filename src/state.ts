import Game from './scenes/game'
import { Order } from './types'
import { getId } from './utils'

type Sub = (state: State) => void

const randomOrder = (): Order => {
  const location = Math.random() > 0.5 ? 'A' : 'B'
  const value = Math.floor(Math.random() * 3) + 1
  const timeLimit = Math.floor(Math.random() * 30) + 30
  return { id: getId(), location, value, timeLimit }
}

export default class State {
  completed: Order[] = []

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
    // Starting orders always the same
    { id: getId(), location: 'A', value: 1, timeLimit: 30 },
    { id: getId(), location: 'B', value: 2, timeLimit: 40 },
    { id: getId(), location: 'A', value: 2, timeLimit: 60 },
  ]
  // score
  score = 0

  constructor(public scene: Game, public orderReset: () => void) {}

  subscribe(fn: Sub) {
    this.subs.push(fn)
  }

  runSubs() {
    this.subs.forEach((fn) => fn(this))

    if (this.orders.length === 0) {
      this.orders = [randomOrder(), randomOrder(), randomOrder()]
      this.orderReset()
    }
  }

  setScore(fn: (score: number) => number) {
    this.score = fn(this.score)
    this.runSubs()
  }

  destroyOrder(id: string) {
    this.scene.sounds.destroy.play()
    this.orders = this.orders.filter((order) => order.id !== id)
    this.runSubs()
  }

  completeOrder(id: string) {
    this.scene.sounds.deliver.play()
    const order = this.orders.find((order) => order.id === id)
    if (!order) return
    this.completed.push(order)
    this.orders = this.orders.filter((order) => order.id !== id)
    this.runSubs()
  }
}
