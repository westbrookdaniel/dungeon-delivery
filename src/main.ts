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

// double size so ui is easier to read
const WIDTH = 250 * 2
const HEIGHT = 200 * 2

export default class Game extends Phaser.Scene {
  cursors!: KeyBindings
  player!: Phaser.Physics.Matter.Image
  enemies: Phaser.Physics.Matter.Image[] = []
  packs: Phaser.Physics.Matter.Image[] = []
  tileset!: Phaser.Tilemaps.Tileset

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
    this.load.spritesheet('tiles_spr', 'assets/ALL_THE_THINGS.png', {
      frameWidth: 16,
      frameHeight: 16,
    })
  }

  create() {
    // spritemap
    const map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16,
    })
    this.tileset = map.addTilesetImage('tileset', 'tiles')!

    map.createLayer('bg', this.tileset)!

    const wallLayer = map.createLayer('wall', this.tileset)!
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
    this.cameras.main.setZoom(2)

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

    // orders
    // list of orders to be fulfilled
    // each has a location, value, and time limit
    // each order has a package
    // when you deliver to the location, you get the value
    // if you don't deliver in time, you lose the value
    // location can be 'A' or 'B'
    // value can be 1, 2, or 3
    // time limit in s
    const orders: Order[] = [
      { id: getId(), location: 'A', value: 1, timeLimit: 20 },
      { id: getId(), location: 'B', value: 2, timeLimit: 30 },
      { id: getId(), location: 'A', value: 2, timeLimit: 40 },
    ]

    // packages sitting on benches for orders
    orders.forEach((order) => {
      const emptyBench = benchs.find((bench) => !bench.order)
      if (!emptyBench) return
      emptyBench.addOrder(order)
    })

    // TODO: Move this to a separate scene
    // display orders in ui
    orders.forEach((order, i) => {
      // container
      const container = this.add.container(0, 0)
      this.cameras.main.ignore(container)
      container.setPosition(10 + i * 32, 10)

      // card
      const card = this.add.rectangle(0, 0, 24, 24, 0xffffff)
      card.setOrigin(0, 0)
      card.setPosition(0, 0)
      card.setScrollFactor(0)

      // text
      const text = this.add.text(0, 0, `${order.location}${order.value}`, {
        fontSize: '8px',
        color: '#000',
        fontFamily: 'PressStart2P',
        resolution: 10,
      })
      text.setOrigin(0, 0)
      text.setPosition(2, 2)
      text.setScrollFactor(0)

      // time bar
      const timeBar = this.add.rectangle(0, 0, 24, 4, 0x000000)
      timeBar.setOrigin(0, 0)
      timeBar.setPosition(0, 24)
      timeBar.setScrollFactor(0)

      // time bar fill
      const timeBarFill = this.add.rectangle(0, 0, 24, 4, 0x00ff00)
      timeBarFill.setOrigin(0, 0)
      timeBarFill.setPosition(0, 24)
      timeBarFill.setScrollFactor(0)

      // time bar fill tween
      this.tweens.add({
        targets: timeBarFill,
        scaleX: 0,
        ease: 'Linear',
        duration: order.timeLimit * 1000,
        onComplete: () => {
          console.log('done!', order)
        },
      })

      container.add([card, text, timeBar, timeBarFill])
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
