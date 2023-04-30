import Game from '../scenes/game'
import { getFrameShapeData } from '../utils'

export default function createPlayer(scene: Game, x: number, y: number) {
  const player = scene.matter.add.sprite(x, y, 'tiles_spr', 237, {
    shape: getFrameShapeData(scene, 237),
  })
  player.setFriction(0.5)
  player.setFrictionAir(0.0005)
  player.setBounce(0.2)
  player.setFixedRotation()

  let holding = false

  // player jumping
  let canJump = true
  scene.cursors.UP.on('down', () => {
    if (canJump) {
      // TODO:
      // canJump = false
      player.setVelocityY(-5)
    }
  })

  player.update = () => {
    // player movement
    if (scene.cursors.RIGHT.isDown) {
      player.setVelocityX(3)
    }
    if (scene.cursors.LEFT.isDown) {
      player.setVelocityX(-3)
    }

    // player picking up packages
    if (scene.cursors.PRI.isDown) {
      const nearestPack = scene.packs.reduce(
        (nearest, pack) => {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            pack.x,
            pack.y
          )
          if (distance < nearest.distance) {
            return { distance, pack }
          }
          return nearest
        },
        { distance: Infinity, pack: null as any }
      )
      if (nearestPack && nearestPack.distance < 24) {
        if (holding) {
          // drop
          holding = false
          nearestPack.pack.setIgnoreGravity(false)
          nearestPack.pack.setPosition(player.x, player.y - 16)
        } else if (nearestPack) {
          // pick up
          holding = true
          nearestPack.pack.setIgnoreGravity(true)
          nearestPack.pack.setPosition(player.x, player.y - 16)
        }
      }
    }
  }

  return player
}
