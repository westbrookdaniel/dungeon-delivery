import { Boot } from './scenes/boot'
import { End } from './scenes/end'
import Game from './scenes/game'
import { Menu } from './scenes/menu'

// double size so ui is easier to read
export const WIDTH = 250 // * 2
export const HEIGHT = 200 // * 2

const { KeyCodes } = Phaser.Input.Keyboard

export const KEY_BINDINGS = {
  PRI: KeyCodes.K,
  SEC: KeyCodes.L,
  LEFT: KeyCodes.A,
  RIGHT: KeyCodes.D,
  UP: KeyCodes.W,
  DOWN: KeyCodes.S,
  SPACE: KeyCodes.SPACE,
}

export type KeyBindings = Record<
  keyof typeof KEY_BINDINGS,
  Phaser.Input.Keyboard.Key
>

export const getKeyBindings = (scene: Phaser.Scene): KeyBindings => {
  return scene.input.keyboard!.addKeys(KEY_BINDINGS) as KeyBindings
}

// wait for font to have loaded before starting game
const font = new FontFace(
  'PressStart2P',
  "local('PressStart2P'), url('./PressStart2P-Regular.ttf')"
)
font.load().then(() => {
  document.fonts.add(font)
  new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
    },
    width: WIDTH,
    height: HEIGHT,
    scene: [Boot, Menu, Game, End],
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
})
