import Game from './main'
import createPack from './pack'
import { Order } from './types'

export type Bench = Phaser.Physics.Matter.Image & {
  order?: Order
  addOrder(order: Order): void
}

export default function createBench(scene: Game, x: number, y: number) {
  const bench: any = scene.matter.add.image(x, y, 'bench', undefined, {
    isStatic: true,
  })

  bench.addOrder = (order: Order) => {
    bench.order = order
    scene.packs.push(createPack(scene, bench.x, bench.y - 16, order))
  }

  return bench as Bench
}
