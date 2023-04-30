import * as Phaser from 'phaser'

export class Boot extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  init() {
    this.add.text(10, 10, 'Loading...', {
      fontFamily: 'PressStart2P',
      fontSize: '8px',
      color: '#fff',
      resolution: 10,
    })
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
    this.scene.start('game')
  }
}
