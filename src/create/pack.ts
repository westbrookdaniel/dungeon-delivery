import Game from '../scenes/game'
import { Order } from '../types'
import { getFrameShapeData } from '../utils'

export interface Pack extends Phaser.Physics.Matter.Image {
  order: Order
}

export default function createPack(
  scene: Game,
  x: number,
  y: number,
  order: Order
) {
  const pack: any = scene.matter.add.sprite(x, y, 'tiles_spr', 226, {
    shape: getFrameShapeData(scene, 226),
  })
  pack.setFriction(0.5)
  pack.setFrictionAir(0.0005)
  pack.setBounce(0.9)

  pack.order = order

  return pack as Pack
}
