import Game from '../scenes/game'
import { getFrameShapeData } from '../utils'

// helps stop glitch through floor
const MAX_VEL = 3

export default function createPlayer(scene: Game, x: number, y: number) {
  const player = scene.matter.add.sprite(x, y, 'tiles_spr', 237, {
    shape: getFrameShapeData(scene, 237),
  })
  player.setFriction(0.5)
  player.setFrictionAir(0.0005)
  player.setBounce(0.2)
  player.setFixedRotation()

  let holding = false
  let facingLeft = false

  // player jumping
  let canJump = true
  scene.cursors.UP.on('down', () => {
    if (canJump) {
      canJump = false
      scene.sounds.jump.play()
      player.setVelocityY(-5)
    }
  })
  scene.cursors.SPACE.on('down', () => {
    if (canJump) {
      canJump = false
      scene.sounds.jump.play()
      player.setVelocityY(-5)
    }
  })

  // when touching something, can jump
  player.setOnCollide((data: any) => {
    const { bodyA, bodyB } = data
    if (bodyA === player.body || bodyB === player.body) {
      canJump = true
    }
  })

  player.update = () => {
    // player movement
    if (scene.cursors.RIGHT.isDown) {
      player.setVelocityX(2)
    }
    if (scene.cursors.LEFT.isDown) {
      player.setVelocityX(-2)
    }

    if (player.body!.velocity.y > MAX_VEL) {
      player.setVelocityY(MAX_VEL)
    }

    // if moving left, use left facing sprite
    if (player.body!.velocity.x > -1) {
      facingLeft = false
      player.setFrame(237)
    } else {
      facingLeft = true
      player.setFrame(236)
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
        { distance: Infinity, pack: null as Phaser.Physics.Matter.Image | null }
      )
      if (nearestPack?.pack && nearestPack.distance < 24) {
        // Honestly suprised this is working but i'll leave it
        if (holding) {
          // drop
          holding = false
          nearestPack.pack.setIgnoreGravity(false)
          if (facingLeft) {
            nearestPack.pack.setPosition(player.x - 14, player.y)
          } else {
            nearestPack.pack.setPosition(player.x + 14, player.y)
          }
          nearestPack.pack.setRotation(0)
          nearestPack.pack.setVelocityY(-4)
          nearestPack.pack.setVelocityX(player.body!.velocity.x * 2)
        } else if (nearestPack) {
          holding = true
          nearestPack.pack.setIgnoreGravity(true)
          nearestPack.pack.setRotation(0)
          if (facingLeft) {
            nearestPack.pack.setPosition(player.x - 14, player.y)
          } else {
            nearestPack.pack.setPosition(player.x + 14, player.y)
          }
        }
      }
    }
  }

  return player
}
