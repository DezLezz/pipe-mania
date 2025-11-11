import { PipePiece, WATER_WIDTH_RATIO } from './PipePiece'
import { PipeType } from './types/PipeType'
import { PipeStage } from './types/PipeStage'
import { Direction, type DirectionValue } from './types/Direction'
import { getDirectionFrom } from './PipeFactory'
import type { BlockPiece } from './BlockPiece'
import type { CellTypeValue } from './types/CellType'
import type { WaterReceiveResult } from './types/WaterReceiveResult'

// Cross piece has openings in all 4 directions (rotation doesn't matter)

export class CrossPiece extends PipePiece {
  private usedDirections: Set<DirectionValue> = new Set()

  constructor(
    scene: Phaser.Scene,
    gridCol: number,
    gridRow: number,
    cellSize: number,
    startX: number,
    startY: number,
    rotation: number = 0
  ) {
    super(
      scene,
      gridCol,
      gridRow,
      PipeType.CROSS,
      PipeStage.DRY,
      rotation,
      cellSize,
      startX,
      startY
    )
  }

  canReceiveWaterFrom(pipe: PipePiece) {
    if (pipe.gridCol !== this.gridCol && pipe.gridRow !== this.gridRow) {
      return false
    }

    // Check if we've already received water from this direction
    const direction = getDirectionFrom(pipe, this)
    if (direction === null) {
      return false
    }

    // If this direction has already been used, don't accept water
    if (this.usedDirections.has(direction)) {
      return false
    }

    return true
  }

  receiveWater(
    scene: Phaser.Scene,
    gameBoard: Array<Array<{ type: CellTypeValue; pipe?: PipePiece | BlockPiece }>>,
    previousPosition: { row: number; col: number }
  ): WaterReceiveResult {
    if (this.waterLevel >= this.config.flow.maxWaterLevel) {
      return {
        waterReceived: false,
        isFull: true,
        nextPosition: null,
        canContinue: false,
      }
    }
    const previousPipe = gameBoard[previousPosition.row][previousPosition.col].pipe as PipePiece

    // Should not happen
    if (!previousPipe) {
      return {
        waterReceived: false,
        isFull: false,
        nextPosition: null,
        canContinue: false,
      }
    }

    const direction = getDirectionFrom(previousPipe, this)

    this.waterLevel++
    this.stage = PipeStage.WATER
    if (!this.waterGraphics) {
      this.waterGraphics = scene.add.graphics()
      this.waterGraphics.setDepth(3)
    }

    this.waterGraphics.clear()
    this.waterGraphics.fillStyle(0x00bfff)

    this.markDirectionAsUsed(direction)

    const waterWidth = this.config.grid.cellSize * WATER_WIDTH_RATIO
    const waterLength =
      (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * this.waterLevel
    const maxWaterLength =
      (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * this.config.flow.maxWaterLevel

    let exitPosition = { row: this.gridRow + 1, col: this.gridCol }
    if (this.usedDirections.has(Direction.TOP) || this.usedDirections.has(Direction.BOTTOM)) {
      let x = this.x - waterWidth / 2
      let y = this.y - this.config.grid.cellSize / 2
      if (direction === Direction.TOP) {
        exitPosition = { row: this.gridRow + 1, col: this.gridCol }
      }
      if (direction === Direction.BOTTOM) {
        y = this.y + this.config.grid.cellSize / 2 - waterLength
        exitPosition = { row: this.gridRow - 1, col: this.gridCol }
      }
      this.waterGraphics.fillRect(
        x,
        y,
        waterWidth,
        direction === Direction.TOP || direction === Direction.BOTTOM ? waterLength : maxWaterLength
      )
    }
    if (this.usedDirections.has(Direction.LEFT) || this.usedDirections.has(Direction.RIGHT)) {
      let x = this.x - this.config.grid.cellSize / 2
      let y = this.y - waterWidth / 2
      if (direction === Direction.LEFT) {
        exitPosition = { row: this.gridRow, col: this.gridCol + 1 }
      }
      if (direction === Direction.RIGHT) {
        x = this.x + this.config.grid.cellSize / 2 - waterLength
        exitPosition = { row: this.gridRow, col: this.gridCol - 1 }
      }
      this.waterGraphics.fillRect(
        x,
        y,
        direction === Direction.LEFT || direction === Direction.RIGHT
          ? waterLength
          : maxWaterLength,
        waterWidth
      )
    }

    const isFull = this.waterLevel === this.config.flow.maxWaterLevel
    let nextPosition: { row: number; col: number } | null = null
    let canContinue = false

    if (isFull) {
      if (this.checkForBlockOrBorder(gameBoard, exitPosition)) {
        return {
          waterReceived: true,
          isFull: true,
          nextPosition: null,
          canContinue: false,
        }
      }
      const nextPipe = gameBoard[exitPosition.row][exitPosition.col]?.pipe
      if (nextPipe instanceof PipePiece) {
        if (nextPipe.canReceiveWaterFrom(this)) {
          nextPosition = exitPosition
          canContinue = true
          this.waterLevel = 0
        }
      }
    }

    return {
      waterReceived: true,
      isFull,
      nextPosition,
      canContinue,
    }
  }

  markDirectionAsUsed(direction: DirectionValue | null) {
    if (!direction) {
      return
    }
    this.usedDirections.add(direction)
  }
}
