import Game from '../scenes/game'
import { getFrameShapeData } from '../utils'

export default function createEnemy(scene: Game, x: number, y: number) {
  const enemy = scene.matter.add.sprite(x, y, 'tiles_spr', 221, {
    shape: getFrameShapeData(scene, 221),
  })

  enemy.setFriction(0.5)
  enemy.setFrictionAir(0.0005)
  enemy.setBounce(0.2)
  enemy.setFixedRotation()

  enemy.update = () => {
    // enemy movement
    // stands still when not near
    // moves towards the player when close
    // but will prefer going towards the package if it's closer
    const distanceToPlayer = Phaser.Math.Distance.Between(
      enemy.x,
      enemy.y,
      scene.player.x,
      scene.player.y
    )

    const enemyNearestPack = scene.packs.reduce(
      (nearest, pack) => {
        const distance = Phaser.Math.Distance.Between(
          enemy.x,
          enemy.y,
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
    if (enemyNearestPack && enemyNearestPack.distance < 128) {
      enemy.setVelocityX(
        Phaser.Math.Clamp(enemyNearestPack.pack.x - enemy.x, -1, 1)
      )
    } else if (distanceToPlayer < 128) {
      enemy.setVelocityX(Phaser.Math.Clamp(scene.player.x - enemy.x, -1, 1))
    }

    // if enemy touches package it will be destroyed
    scene.packs.forEach((pack) => {
      const isTouchingPack =
        Phaser.Math.Distance.Between(enemy.x, enemy.y, pack.x, pack.y) < 16
      if (isTouchingPack) {
        scene.matter.world.remove(pack)
        pack.destroy()
        // cleanup destroyed packages
        scene.packs = scene.packs.filter((pack) => pack.active)
        scene.state.destroyOrder(pack.order.id)
      }
    })
  }

  return enemy
}
