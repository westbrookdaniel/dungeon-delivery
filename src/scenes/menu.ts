import * as Phaser from 'phaser'
import { WIDTH } from '../main'

export class Menu extends Phaser.Scene {
  constructor() {
    super('menu')
  }

  create() {
    const sounds = {
      click: this.sound.add('click', { loop: false }),
      menu: this.sound.add('music', { loop: true }),
    }

    sounds.menu.play()

    const title = this.add.text(0, 0, 'Dungeon Delivery', {
      align: 'center',
      fontSize: '8px',
      color: '#fff',
      fontFamily: 'PressStart2P',
      resolution: 10,
    })
    title.setOrigin(0.5)
    title.setPosition(WIDTH / 2, 30)

    // instructions
    const instructions = this.add.text(0, 0, instr, {
      align: 'center',
      fontSize: '8px',
      color: '#615553',
      fontFamily: 'PressStart2P',
      resolution: 10,
    })
    instructions.setOrigin(0.5)
    instructions.setPosition(WIDTH / 2, 100)

    // add play button
    const play = this.add.text(0, 0, 'Play', {
      align: 'center',
      fontSize: '8px',
      color: '#615553',
      fontFamily: 'PressStart2P',
      resolution: 10,
      backgroundColor: '#222',
      padding: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5,
      },
    })
    play.setOrigin(0.5)
    play.setPosition(WIDTH / 2, 170)

    play.setInteractive({ useHandCursor: true })
    play.on('pointerover', () => {
      play.setColor('#fff')
      play.setBackgroundColor('#a3665b')
      sounds.click.play()
    })
    play.on('pointerout', () => {
      play.setColor('#615553')
      play.setBackgroundColor('#222')
    })
    play.on('pointerdown', () => {
      sounds.menu.stop()
      this.scene.start('game')
    })
  }
}

const instr = `
deliver supplies to the 
dungeon merchants!

deliver to the correct 
merchant on time to get paid

don't let the packages
get destroyed!



wasd to move
k to grab package

`
