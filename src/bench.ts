import Game from './main'
import createPack from './pack'
import { Order } from './types'

export type Bench = {
  order: Order | null
  addOrder(order: Order): void
}

/**
 * These aren't actual benches, just markers for where packages should be
 */
export default function createBench(scene: Game, x: number, y: number) {
  const bench: Bench = {
    order: null,
    addOrder(order: Order) {
      bench.order = order
      scene.packs.push(createPack(scene, x, y, order))
    },
  }

  return bench
}
