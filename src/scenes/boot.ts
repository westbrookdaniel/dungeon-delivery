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
    this.load.image('tiles', 'assets/ALL_THE_THINGS.png')
    this.load.tilemapTiledJSON('map', 'assets/tileset.json')
    this.load.spritesheet('tiles_spr', 'assets/ALL_THE_THINGS.png', {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.audio('music', 'assets/sounds/music.mp3')
    this.load.audio('deliver', 'assets/sounds/deliverPack.mp3')
    this.load.audio('destroy', 'assets/sounds/destroyPack.mp3')
    this.load.audio('click', 'assets/sounds/click.mp3')
    this.load.audio('kick', 'assets/sounds/kick.mp3')
    this.load.audio('jump', 'assets/sounds/jump.mp3')
  }

  create() {
    this.scene.start('menu')
  }
}
