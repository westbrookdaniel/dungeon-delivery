import Game from '../scenes/game'
import { getFrameShapeData } from '../utils'

export default function createMerch(
  scene: Game,
  x: number,
  y: number,
  merchType: string
) {
  const merch = scene.matter.add.sprite(x, y, 'tiles_spr', 222, {
    shape: getFrameShapeData(scene, 222),
  })

  merch.setFrictionAir(0.0005)
  merch.setBounce(0.2)
  merch.setFixedRotation()
  ;(merch.body as MatterJS.BodyType).slop = 0

  // text above saying which merch type he is
  const text = scene.add.text(0, 0, `Merchant\n${merchType}`, {
    fontSize: '8px',
    align: 'center',
    color: '#615553',
    fontFamily: 'PressStart2P',
    resolution: 10,
  })
  text.setOrigin(0.5, 0)
  text.setPosition(merch.x + 1, merch.y - 24)

  merch.update = () => {
    // if touches package add score
    scene.packs.forEach((pack) => {
      const isTouchingPack =
        Phaser.Math.Distance.Between(merch.x, merch.y, pack.x, pack.y) < 16
      if (isTouchingPack && pack.order.location === merchType) {
        // check order for pack is not destroyed
        if (!scene.state.orders.find((o) => o.id == pack.order.id)) return

        scene.matter.world.remove(pack)
        pack.destroy()
        // cleanup destroyed packages
        scene.packs = scene.packs.filter((pack) => pack.active)

        scene.state.setScore((s) => s + 10 * pack.order.value)
        scene.state.completeOrder(pack.order.id)
      }
    })
  }

  return merch
}
