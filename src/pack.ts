import Game from './main'
import { Order } from './types'

export default function createPack(
  scene: Game,
  x: number,
  y: number,
  _order: Order
) {
  const pack = scene.matter.add.image(x, y, 'package')
  pack.setFriction(0.05)
  pack.setFrictionAir(0.0005)
  pack.setBounce(0.9)

  return pack
}
