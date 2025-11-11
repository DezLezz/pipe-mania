import Phaser from 'phaser'
import { convertGridToScreenCoordinates } from '../utils'

export class HoverManager {
  private hoverBorder: Phaser.GameObjects.Graphics
  private hoveredCell: { row: number; col: number } | null = null
  private cellSize: number
  private startX: number
  private startY: number

  constructor(scene: Phaser.Scene, cellSize: number, startX: number, startY: number) {
    this.cellSize = cellSize
    this.startX = startX
    this.startY = startY

    this.hoverBorder = scene.add.graphics()
    this.hoverBorder.setVisible(false)
    this.hoverBorder.setDepth(1000)
  }

  setHoveredCell(row: number, col: number): void {
    this.hoveredCell = { row, col }
    this.updateHoverBorder()
  }

  clearHoveredCell(): void {
    this.hoveredCell = null
    this.updateHoverBorder()
  }

  private updateHoverBorder(): void {
    this.hoverBorder.clear()

    if (this.hoveredCell) {
      const gridPosition = convertGridToScreenCoordinates(
        this.hoveredCell.col,
        this.hoveredCell.row,
        this.cellSize,
        this.startX,
        this.startY
      )

      this.hoverBorder.lineStyle(2, 0xf03030, 1)
      this.hoverBorder.strokeRect(
        gridPosition.x + 2 - this.cellSize / 2,
        gridPosition.y + 2 - this.cellSize / 2,
        this.cellSize - 4,
        this.cellSize - 4
      )
      this.hoverBorder.setVisible(true)
    } else {
      this.hoverBorder.setVisible(false)
    }
  }
}
