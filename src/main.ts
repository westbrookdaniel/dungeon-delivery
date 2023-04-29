import * as Phaser from 'phaser'
import createEnemy from './enemy'
import createPlayer from './player'
import createPack from './pack'
import { Order } from './types'
import createBench, { Bench } from './bench'
const { KeyCodes } = Phaser.Input.Keyboard

const KEY_BINDINGS = {
  PRI: KeyCodes.K,
  SEC: KeyCodes.L,
  LEFT: KeyCodes.A,
  RIGHT: KeyCodes.D,
  UP: KeyCodes.W,
  DOWN: KeyCodes.S,
}

const getId = () => Math.random().toString(36).substr(2, 9)

type KeyBindings = Record<keyof typeof KEY_BINDINGS, Phaser.Input.Keyboard.Key>

const WIDTH = 250
const HEIGHT = 200

export default class Game extends Phaser.Scene {
  cursors!: KeyBindings
  player!: Phaser.Physics.Matter.Image
  enemies: Phaser.Physics.Matter.Image[] = []
  packs: Phaser.Physics.Matter.Image[] = []

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('package', 'assets/package.png')
    this.load.image('player', 'assets/player.png')
    this.load.image('bench', 'assets/bench.png')
    this.load.image('floor', 'assets/floor.png')

    this.load.image('tiles', 'assets/ALL_THE_THINGS.png')
    this.load.tilemapTiledJSON('map', 'assets/tileset.json')
  }

  create() {
    // map
    // home base
    // 2 delivery points
    // floor
    // this.matter.add.imageStack(
    //   'floor',
    //   null as any,
    //   0,
    //   HEIGHT - 16 * 2,
    //   25,
    //   2,
    //   0,
    //   0,
    //   { restitution: 0.4, isStatic: true }
    // )
    const map = this.make.tilemap({ key: 'map', tileWidth: 16, tileHeight: 16 })
    const tileset = map.addTilesetImage('tileset', 'tiles')!

    map.createLayer('bg', tileset)!

    const wallLayer = map.createLayer('wall', tileset)!
    wallLayer.setCollisionByProperty({ collides: true })
    this.matter.world.convertTilemapLayer(wallLayer)

    this.matter.world.setBounds(0, 0, wallLayer.width, wallLayer.height)

    // ------- debug -------
    // const debugGraphics = this.add.graphics().setAlpha(0.75)
    // wallLayer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // })

    // controls
    this.cursors = this.input.keyboard!.addKeys(KEY_BINDINGS) as KeyBindings

    // player
    this.player = createPlayer(this, 100, 100)

    // camera
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05)
    this.cameras.main.setBounds(0, 0, wallLayer.width, wallLayer.height)
    this.cameras.main.deadzone = new Phaser.Geom.Rectangle(
      WIDTH / 2 - 20,
      HEIGHT / 2 - 20
    )

    const benchs: Bench[] = []

    // object spritemap layers
    map.objects.forEach((layer) => {
      switch (layer.name) {
        case 'enemy':
          layer.objects.forEach((obj) => {
            this.enemies.push(createEnemy(this, obj.x!, obj.y!))
          })
          break
        case 'player':
          // assume theres only one
          const obj = layer.objects[0]
          this.player.setPosition(obj.x!, obj.y!)
          break
        case 'pack':
          layer.objects.forEach((obj) => {
            benchs.push(createBench(this, obj.x!, obj.y!))
          })
      }
    })
    // this.enemy = createEnemy(this, WIDTH - 100, 100)

    // orders
    // list of orders to be fulfilled
    // each has a location, value, and time limit
    // each order has a package
    // when you deliver to the location, you get the value
    // if you don't deliver in time, you lose the value
    // location can be 'A' or 'B'
    // value can be 1, 2, or 3
    // time limit can be 10s, 20s, or 30sA
    const orders: Order[] = [
      { id: getId(), location: 'A', value: 1, timeLimit: 10 },
      { id: getId(), location: 'B', value: 2, timeLimit: 20 },
      { id: getId(), location: 'A', value: 2, timeLimit: 30 },
    ]

    // packages sitting on benches for orders
    orders.forEach((order) => {
      const emptyBench = benchs.find((bench) => !bench.order)
      if (!emptyBench) return
      emptyBench.addOrder(order)
    })
  }

  update() {
    this.player.update()
    this.enemies.forEach((e) => e.update())
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
