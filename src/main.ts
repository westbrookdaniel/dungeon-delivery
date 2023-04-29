import * as Phaser from 'phaser'
import createEnemy from './enemy'
import createPlayer from './player'
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
    this.player = createPlayer(this, 100, 100)

    // map
    // home base
    // 2 delivery points

    // enemies
    this.enemy = createEnemy(this, WIDTH - 100, 100)

    // order generator
  }

  update() {
    this.player.update()
    this.enemy.update()

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
