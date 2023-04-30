import * as Phaser from 'phaser'
import { WIDTH } from '../main'

export class End extends Phaser.Scene {
  constructor() {
    super('end')
  }

  create() {
    // get score from state
    const data = this.scene.settings.data as {
      score: number
      time: number
    }
    const score = data.score ?? 0
    // dont actually do anything with this
    const time = data.time ?? 0

    const title = this.add.text(0, 0, 'Game Over', {
      align: 'center',
      fontSize: '8px',
      color: '#fff',
      fontFamily: 'PressStart2P',
      resolution: 10,
    })
    title.setOrigin(0.5)
    title.setPosition(WIDTH / 2, 75)

    // instructions
    const instructions = this.add.text(
      0,
      0,
      `
you earned $${score}!
`,
      {
        align: 'center',
        fontSize: '8px',
        color: '#615553',
        fontFamily: 'PressStart2P',
        resolution: 10,
      }
    )
    instructions.setOrigin(0.5)
    instructions.setPosition(WIDTH / 2, 100)

    // add play button
    const restart = this.add.text(0, 0, 'Menu', {
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
    restart.setOrigin(0.5)
    restart.setPosition(WIDTH / 2, 140)

    restart.setInteractive({ useHandCursor: true })
    restart.on('pointerover', () => {
      restart.setColor('#fff')
      restart.setBackgroundColor('#a3665b')
    })
    restart.on('pointerout', () => {
      restart.setColor('#615553')
      restart.setBackgroundColor('#222')
    })
    restart.on('pointerdown', () => {
      this.scene.start('menu')
    })
  }
}
