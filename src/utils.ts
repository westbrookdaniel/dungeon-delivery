import Game from './main'

export const getFrameShapeData = (scene: Game, frame: number) => {
  const data = (scene.tileset.tileData as any)[frame].objectgroup.objects[0]
  if (!data.rectangle) throw new Error('Only rectangles are supported')
  return {
    type: 'rectangle',
    width: data.width,
    height: data.height,
    x: data.x,
    y: data.y,
  }
}
