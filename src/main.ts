import * as Phaser from 'phaser'
const { KeyCodes } = Phaser.Input.Keyboard

const KEY_BINDINGS = {
  PRI: KeyCodes.K,
  SEC: KeyCodes.L,
  LEFT: KeyCodes.A,
  RIGHT: KeyCodes.D,
  UP: KeyCodes.W,
  DOWN: KeyCodes.S,
}

type KeyBindings = Record<keyof typeof KEY_BINDINGS, Phaser.Input.Keyboard.Key>

const WIDTH = 400
const HEIGHT = 300

let holding = false

export default class Game extends Phaser.Scene {
  cursors!: KeyBindings
  player!: Phaser.Physics.Matter.Image
  enemy!: Phaser.Physics.Matter.Image
  packs!: Phaser.Physics.Matter.Image[]

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('package', 'assets/package.png')
    this.load.image('player', 'assets/player.png')
    this.load.image('floor', 'assets/floor.png')
  }

  create() {
    // player control
    this.cursors = this.input.keyboard!.addKeys(KEY_BINDINGS) as KeyBindings

    // package
    const pack = this.matter.add.image(100, 100, 'package')
    pack.setFriction(0.05)
    pack.setFrictionAir(0.0005)
    pack.setBounce(0.9)
    const pack2 = this.matter.add.image(100, 100, 'package')
    pack2.setFriction(0.05)
    pack2.setFrictionAir(0.0005)
    pack2.setBounce(0.9)
    this.packs = [pack, pack2]

    // floor
    this.matter.add.imageStack(
      'floor',
      null as any,
      0,
      HEIGHT - 16 * 2,
      25,
      2,
      0,
      0,
      { restitution: 0.4, isStatic: true }
    )

    // player
    this.player = this.matter.add.image(100, 100, 'player')
    this.player.setFriction(0.05)
    this.player.setFrictionAir(0.0005)
    this.player.setBounce(0.2)
    this.player.setFixedRotation()

    // player jumping
    let canJump = true
    this.cursors.UP.on('down', () => {
      if (canJump) {
        // canJump = false
        this.player.setVelocityY(-7)
      }
    })

    // map
    // home base
    // 2 delivery points

    // enemies
    this.enemy = this.matter.add.image(WIDTH - 100, 100, 'player')
    this.enemy.setFriction(0.05)
    this.enemy.setFrictionAir(0.0005)
    this.enemy.setBounce(0.2)
    this.enemy.setFixedRotation()

    // order generator
  }

  update() {
    // player movement
    if (this.cursors.RIGHT.isDown) {
      this.player.setVelocityX(3)
    }
    if (this.cursors.LEFT.isDown) {
      this.player.setVelocityX(-3)
    }

    // player picking up packages
    if (this.cursors.PRI.isDown) {
      const nearestPack = this.packs.reduce(
        (nearest, pack) => {
          const distance = Phaser.Math.Distance.Between(
            this.player.x,
            this.player.y,
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
      if (nearestPack && nearestPack.distance < 128) {
        if (holding) {
          // drop
          holding = false
          nearestPack.pack.setIgnoreGravity(false)
          nearestPack.pack.setPosition(this.player.x, this.player.y - 16)
        } else if (nearestPack) {
          // pick up
          holding = true
          nearestPack.pack.setIgnoreGravity(true)
          nearestPack.pack.setPosition(this.player.x, this.player.y - 16)
        }
      }
    }

    // enemy movement
    // stands still when not near
    // moves towards the player when close
    // but will prefer going towards the package if it's closer
    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y
    )

    const enemyNearestPack = this.packs.reduce(
      (nearest, pack) => {
        const distance = Phaser.Math.Distance.Between(
          this.enemy.x,
          this.enemy.y,
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
      this.enemy.setVelocityX(
        Phaser.Math.Clamp(enemyNearestPack.pack.x - this.enemy.x, -1, 1)
      )
    } else if (distanceToPlayer < 128) {
      this.enemy.setVelocityX(
        Phaser.Math.Clamp(this.player.x - this.enemy.x, -1, 1)
      )
    }

    // if enemy touches package it will be destroyed
    this.packs.forEach((pack) => {
      const isTouchingPack =
        Phaser.Math.Distance.Between(
          this.enemy.x,
          this.enemy.y,
          pack.x,
          pack.y
        ) < 24
      if (isTouchingPack) {
        this.matter.world.remove(pack)
        pack.destroy()
      }
    })

    // cleanup destroyed packages
    this.packs = this.packs.filter((pack) => pack.active)
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  scene: Game,
  backgroundColor: '#000',
  pixelArt: true,
  physics: {
    default: 'matter',
    matter: {
      // debug: true,
    },
  },
  input: {
    keyboard: true,
  },
})
