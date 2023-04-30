import * as Phaser from 'phaser'
import createEnemy from '../create/enemy'
import createPlayer from '../create/player'
import createBench, { Bench } from '../create/bench'
import { HEIGHT, KeyBindings, WIDTH, getKeyBindings } from '../main'
import State from '../state'
import createMerch from '../create/merch'
import { Pack } from '../create/pack'

export default class Game extends Phaser.Scene {
  cursors!: KeyBindings
  player!: Phaser.Physics.Matter.Image
  enemies: Phaser.Physics.Matter.Image[] = []
  merchs: Phaser.Physics.Matter.Image[] = []
  packs: Pack[] = []
  tileset!: Phaser.Tilemaps.Tileset

  state = new State()

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
    this.cursors = getKeyBindings(this)

    // player
    this.player = createPlayer(this, 100, 100)

    // camera
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05)
    this.cameras.main.setBounds(0, 0, wallLayer.width, wallLayer.height)
    this.cameras.main.deadzone = new Phaser.Geom.Rectangle(
      WIDTH / 2 - 20,
      HEIGHT / 2 - 20
    )
    // this.cameras.main.setZoom(2)

    const benchs: Bench[] = []

    // object spritemap layers
    map.objects.forEach((layer) => {
      switch (layer.name) {
        case 'enemy':
          layer.objects.forEach((obj) => {
            this.enemies.push(createEnemy(this, obj.x!, obj.y!))
          })
          break
        case 'merch':
          layer.objects.forEach((obj, i) => {
            this.merchs.push(
              createMerch(this, obj.x!, obj.y!, i == 0 ? 'A' : 'B')
            )
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
          break
      }
    })

    // packages sitting on benches for orders
    this.state.orders.forEach((order) => {
      const emptyBench = benchs.find((bench) => !bench.order)
      if (!emptyBench) return
      emptyBench.addOrder(order)
    })

    /**
     * Flop together ui
     * Add merchant to complete orders
     * Make game loop work
     * Add boot/menu/end scenes
     */

    // TODO: Move this to a separate scene and add back camera zoom
    // display orders in ui
    this.state.orders.forEach((order, i) => {
      // container
      const container = this.add.container(0, 0)
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
      const tw = this.tweens.add({
        targets: timeBarFill,
        scaleX: 0,
        ease: 'Linear',
        duration: order.timeLimit * 1000,
        onComplete: () => {
          console.log('remove order!', order)
        },
      })

      // tw.destroy

      container.add([card, text, timeBar, timeBarFill])
    })

    // time
    const timeText = this.add.text(0, 0, 'Time: 0', {
      fontSize: '8px',
      color: '#FFF',
      fontFamily: 'PressStart2P',
      align: 'right',
      resolution: 10,
    })
    timeText.setOrigin(0, 0)
    timeText.setPosition(WIDTH - 90, 10)
    timeText.setScrollFactor(0)

    this.tweens.addCounter({
      from: 60 * 60 * 60,
      to: 0,
      duration: 60 * 60 * 60,
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue() / 1000)
        timeText.setText(`Time: ${value}`)
      },
      onComplete: () => {
        console.log('game end!')
      },
    })

    // score
    const scoreText = this.add.text(0, 0, '$0', {
      fontSize: '8px',
      color: '#FFF',
      fontFamily: 'PressStart2P',
      align: 'right',
      resolution: 10,
    })
    scoreText.setOrigin(0, 0)
    scoreText.setPosition(WIDTH - 90, 22)
    scoreText.setScrollFactor(0)
    this.state.subscribe((state) => {
      scoreText.setText(`$${state.score}`)
    })
  }

  update() {
    this.player.update()
    this.enemies.forEach((e) => e.update())
    this.merchs.forEach((e) => e.update())
  }
}
