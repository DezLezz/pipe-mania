import { convertGridToScreenCoordinates } from './utils'

export class BlockPiece {
  sprite: Phaser.GameObjects.Image
  gridCol: number
  gridRow: number
  x: number
  y: number

  constructor(
    scene: Phaser.Scene,
    gridCol: number,
    gridRow: number,
    cellSize: number,
    startX: number,
    startY: number
  ) {
    this.gridCol = gridCol
    this.gridRow = gridRow

    const screenCoords = convertGridToScreenCoordinates(gridCol, gridRow, cellSize, startX, startY)
    this.x = screenCoords.x
    this.y = screenCoords.y

    this.sprite = scene.add.image(this.x, this.y, 'blocked_tile')
    this.sprite.setDepth(2)
  }
}
