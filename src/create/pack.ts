import Game from '../scenes/game'
import { Order } from '../types'
import { getFrameShapeData } from '../utils'

// helps stop glitch through floor
const MAX_VEL = 3

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
  ;(pack.body as MatterJS.BodyType).slop = 0

  pack.order = order

  pack.update = () => {
    if (pack.body!.velocity.y > MAX_VEL) {
      pack.setVelocityY(MAX_VEL)
    }
  }

  return pack as Pack
}
