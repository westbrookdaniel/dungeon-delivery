import Game from './scenes/game'

// double size so ui is easier to read
export const WIDTH = 250 * 2
export const HEIGHT = 200 * 2

const { KeyCodes } = Phaser.Input.Keyboard

export const KEY_BINDINGS = {
  PRI: KeyCodes.K,
  SEC: KeyCodes.L,
  LEFT: KeyCodes.A,
  RIGHT: KeyCodes.D,
  UP: KeyCodes.W,
  DOWN: KeyCodes.S,
}

export type KeyBindings = Record<
  keyof typeof KEY_BINDINGS,
  Phaser.Input.Keyboard.Key
>

export const getKeyBindings = (scene: Phaser.Scene): KeyBindings => {
  return scene.input.keyboard!.addKeys(KEY_BINDINGS) as KeyBindings
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
