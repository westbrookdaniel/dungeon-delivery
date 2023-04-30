import Game from '../scenes/game'
import createPack from './pack'
import { Order } from '../types'

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

      // text above saying which merch it is for
      const text = scene.add.text(
        0,
        0,
        `${order.location}\n$${order.value * 10}`,
        {
          fontSize: '8px',
          color: '#615553',
          align: 'center',
          fontFamily: 'PressStart2P',
          resolution: 10,
        }
      )
      text.setOrigin(0.5, 0)
      text.setPosition(x + 1, y - 20)

      scene.state.subscribe((s) => {
        if (s.orders.find((o) => o.id == order.id)) return
        text.destroy()
        bench.order = null
      })

      scene.packs.push(createPack(scene, x, y, order))
    },
  }

  return bench
}
