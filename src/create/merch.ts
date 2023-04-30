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

  // text above saying which merch type he is
  const text = scene.add.text(0, 0, `Merch ${merchType}`, {
    fontSize: '8px',
    color: '#615553',
    fontFamily: 'PressStart2P',
    resolution: 10,
  })
  text.setOrigin(0, 0)
  text.setPosition(merch.x - 25, merch.y - 16)

  merch.update = () => {
    // if touches package add score
    scene.packs.forEach((pack) => {
      const isTouchingPack =
        Phaser.Math.Distance.Between(merch.x, merch.y, pack.x, pack.y) < 16
      if (isTouchingPack && pack.order.location === merchType) {
        scene.matter.world.remove(pack)
        pack.destroy()
        // cleanup destroyed packages
        scene.packs = scene.packs.filter((pack) => pack.active)

        scene.state.setScore((s) => s + 10)
        scene.state.destroyOrder(pack.order.id)
      }
    })
  }

  return merch
}
