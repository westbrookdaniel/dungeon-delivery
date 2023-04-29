import Game from './main'
import { Order } from './types'
import { getFrameShapeData } from './utils'

export default function createPack(
  scene: Game,
  x: number,
  y: number,
  _order: Order
) {
  const pack = scene.matter.add.sprite(x, y, 'tiles_spr', 226, {
    shape: getFrameShapeData(scene, 226),
  })
  pack.setFriction(0.5)
  pack.setFrictionAir(0.0005)
  pack.setBounce(0.9)

  return pack
}
