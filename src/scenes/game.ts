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

  state!: State

  constructor() {
    super('game')
  }

  create() {
    // Reset/Setup state
    this.state = new State(this)
    this.enemies = []
    this.merchs = []
    this.packs = []

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
      const card = this.add.rectangle(0, 0, 28, 24, 0xffffff)
      card.setOrigin(0, 0)
      card.setPosition(0, 0)
      card.setScrollFactor(0)

      // text
      const text = this.add.text(
        0,
        0,
        `${order.location}\n$${order.value * 10}`,
        {
          fontSize: '8px',
          color: '#000',
          fontFamily: 'PressStart2P',
          resolution: 10,
        }
      )
      text.setOrigin(0, 0)
      text.setPosition(2, 2)
      text.setScrollFactor(0)

      // time bar
      const timeBar = this.add.rectangle(0, 0, 28, 4, 0x000000)
      timeBar.setOrigin(0, 0)
      timeBar.setPosition(0, 24)
      timeBar.setScrollFactor(0)

      // time bar fill
      const timeBarFill = this.add.rectangle(0, 0, 28, 4, 0x00ff00)
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
          this.state.destroyOrder(order.id)
        },
      })
      // tw.destroy
      this.state.subscribe((s) => {
        if (s.orders.find((o) => o.id == order.id)) return
        tw.stop()
        tw.isActive() && tw.remove()
        timeBarFill.fillColor = 0xaaaaaa
        // add tick if completed otherwise cross
        if (s.completed.find((o) => o.id == order.id)) {
          const tick = this.add.text(0, 0, '✓', {
            fontSize: '8px',
            color: '#00ff00',
            fontFamily: 'PressStart2P',
            resolution: 10,
          })
          tick.setOrigin(0, 0)
          tick.setPosition(2, 24)
          tick.setScrollFactor(0)
          container.add(tick)
        } else {
          const cross = this.add.text(0, 0, '✕', {
            fontSize: '8px',
            color: '#ff0000',
            fontFamily: 'PressStart2P',
            resolution: 10,
          })
          cross.setOrigin(0, 0)
          cross.setPosition(2, 24)
          cross.setScrollFactor(0)
          container.add(cross)
        }
      })

      container.add([card, text, timeBar, timeBarFill])
    })

    // score
    const scoreText = this.add.text(0, 0, '$0', {
      fontSize: '8px',
      color: '#FFF',
      fontFamily: 'PressStart2P',
      align: 'right',
      resolution: 10,
    })
    scoreText.setOrigin(1, 1)
    scoreText.setPosition(WIDTH - 12, 18)
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
