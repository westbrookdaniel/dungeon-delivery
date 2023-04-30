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

  benchs: Bench[] = []

  state!: State
  map!: Phaser.Tilemaps.Tilemap

  visibleOrders: Phaser.GameObjects.Container[] = []

  sounds!: {
    click: Phaser.Sound.BaseSound
    deliver: Phaser.Sound.BaseSound
    destroy: Phaser.Sound.BaseSound
    jump: Phaser.Sound.BaseSound
    kick: Phaser.Sound.BaseSound
  }

  constructor() {
    super('game')
  }

  create() {
    this.sounds = {
      click: this.sound.add('click', { loop: false }),
      deliver: this.sound.add('deliver', { loop: false }),
      destroy: this.sound.add('destroy', { loop: false }),
      jump: this.sound.add('jump', { loop: false, volume: 0.2 }),
      kick: this.sound.add('kick', { loop: false }),
    }

    // Reset/Setup state
    this.enemies = []
    this.merchs = []
    this.packs = []
    this.visibleOrders = []
    this.benchs = []
    this.state = new State(this, () => {
      this.visibleOrders.forEach((order) => order.destroy())
      this.visibleOrders = []
      this.visibleOrders = createVisibleOrders(this)
    })

    // spritemap
    this.map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16,
    })
    this.tileset = this.map.addTilesetImage('tileset', 'tiles')!

    this.map.createLayer('bg', this.tileset)!

    const wallLayer = this.map.createLayer('wall', this.tileset)!
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

    // object spritemap layers
    this.map.objects.forEach((layer) => {
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
            this.benchs.push(createBench(this, obj.x!, obj.y!))
          })
          break
      }
    })

    /**
     * Flop together ui
     * Add merchant to complete orders
     * Make game loop work
     * Add boot/menu/end scenes
     */

    // TODO: Move this to a separate scene and add back camera zoom
    // display orders in ui
    this.visibleOrders = createVisibleOrders(this)

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

    // button in bottom left to exit to menu
    const exit = this.add.text(0, 0, '✕', {
      fontSize: '8px',
      color: '#fff',
      fontFamily: 'PressStart2P',
      align: 'right',
      resolution: 10,
      padding: {
        left: 3,
        right: 2,
        top: 1,
        bottom: 3,
      },
    })
    exit.setOrigin(0, 1)
    exit.setPosition(10, HEIGHT - 10)
    exit.setScrollFactor(0)
    exit.setInteractive({ useHandCursor: true })
    exit.on('pointerdown', () => {
      this.scene.start('menu')
    })
    exit.on('pointerover', () => {
      exit.setColor('#fff')
      exit.setBackgroundColor('#a3665b')
      this.sounds.click.play()
    })
    exit.on('pointerout', () => {
      exit.setColor('#fff')
      exit.setBackgroundColor('#00000000')
    })

    // add timer tweaned from 120 to 0
    const timerText = this.add.text(0, 0, '120', {
      fontSize: '8px',
      color: '#FFF',
      fontFamily: 'PressStart2P',
      align: 'right',
      resolution: 10,
    })
    timerText.setOrigin(1, 1)
    timerText.setPosition(WIDTH - 12, HEIGHT - 10)
    timerText.setScrollFactor(0)
    const timer = this.tweens.addCounter({
      from: 120,
      to: 0,
      duration: 120000,
      onUpdate: () => {
        timerText.setText(Math.round(timer.getValue()).toString())
      },
      onComplete: () => {
        const time = Math.round((this.time.now - this.time.startTime) / 1000)
        this.scene.start('end', { score: this.state.score, time })
      },
    })
  }

  update() {
    this.player.update()
    this.enemies.forEach((e) => e.update())
    this.merchs.forEach((e) => e.update())
  }
}

function createVisibleOrders(scene: Game) {
  scene.state.orders.forEach((order) => {
    const emptyBench = scene.benchs.find((bench) => !bench.order)
    if (!emptyBench) return
    emptyBench.addOrder(order)
  })

  return scene.state.orders.map((order, i) => {
    // container
    const container = scene.add.container(0, 0)
    container.setPosition(10 + i * 32, 10)

    // card
    const card = scene.add.rectangle(0, 0, 28, 24, 0xffffff)
    card.setOrigin(0, 0)
    card.setPosition(0, 0)
    card.setScrollFactor(0)

    // text
    const text = scene.add.text(
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
    const timeBar = scene.add.rectangle(0, 0, 28, 4, 0x000000)
    timeBar.setOrigin(0, 0)
    timeBar.setPosition(0, 24)
    timeBar.setScrollFactor(0)

    // time bar fill
    const timeBarFill = scene.add.rectangle(0, 0, 28, 4, 0x00ff00)
    timeBarFill.setOrigin(0, 0)
    timeBarFill.setPosition(0, 24)
    timeBarFill.setScrollFactor(0)

    // time bar fill tween
    const tw = scene.tweens.add({
      targets: timeBarFill,
      scaleX: 0,
      ease: 'Linear',
      duration: order.timeLimit * 1000,
      onComplete: () => {
        scene.state.destroyOrder(order.id)
        const pack = scene.packs.find((pack) => pack.order.id == order.id)
        if (!pack) return
        pack.destroy()
        // cleanup destroyed packages
        scene.packs = scene.packs.filter((pack) => pack.active)
      },
    })
    // tw.destroy
    scene.state.subscribe((s) => {
      if (s.orders.find((o) => o.id == order.id)) return
      tw.stop()
      tw.isActive() && tw.remove()
      timeBarFill.fillColor = 0xaaaaaa
      // add tick if completed otherwise cross
      if (s.completed.find((o) => o.id == order.id)) {
        const tick = scene.add.text(0, 0, '✓', {
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
        const cross = scene.add.text(0, 0, '✕', {
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

    return container
  })
}
