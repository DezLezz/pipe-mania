import { PipePiece, WATER_WIDTH_RATIO } from './PipePiece'
import { PipeType } from './types/PipeType'
import { PipeStage } from './types/PipeStage'
import { Direction } from './types/Direction'
import { getDirectionFrom } from './PipeFactory'
import type { BlockPiece } from './BlockPiece'
import type { CellTypeValue } from './types/CellType'
import type { WaterReceiveResult } from './types/WaterReceiveResult'

// Default pipe state is vertical

export class StraightPiece extends PipePiece {
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
      PipeType.STRAIGHT,
      PipeStage.DRY,
      rotation,
      cellSize,
      startX,
      startY
    )
  }

  canReceiveWaterFrom(pipe: PipePiece) {
    if (!super.canReceiveWaterFrom(pipe)) {
      return false
    }

    const direction = getDirectionFrom(pipe, this)
    if (direction === null) {
      return false
    }

    // Straight piece: vertical (0° or 180°) accepts from top/bottom
    // Horizontal (90° or 270°) accepts from left/right
    const isVertical = this.rotation === 0 || this.rotation === 180
    const isHorizontal = this.rotation === 90 || this.rotation === 270
    if (isVertical && (direction === Direction.TOP || direction === Direction.BOTTOM)) {
      return true
    }

    if (isHorizontal && (direction === Direction.LEFT || direction === Direction.RIGHT)) {
      return true
    }

    return false
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

    // should not happen
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

    const waterWidth = this.config.grid.cellSize * WATER_WIDTH_RATIO
    const waterLength =
      (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * this.waterLevel

    let exitPosition = { row: this.gridRow + 1, col: this.gridCol }
    if (this.rotation === 0 || this.rotation === 180) {
      if (direction === Direction.TOP) {
        const x = this.x - waterWidth / 2
        const y = this.y - this.config.grid.cellSize / 2
        this.waterGraphics.fillRect(x, y, waterWidth, waterLength)
        exitPosition = { row: this.gridRow + 1, col: this.gridCol }
      } else if (direction === Direction.BOTTOM) {
        const x = this.x - waterWidth / 2
        const y = this.y + this.config.grid.cellSize / 2 - waterLength
        this.waterGraphics.fillRect(x, y, waterWidth, waterLength)
        exitPosition = { row: this.gridRow - 1, col: this.gridCol }
      }
    } else if (this.rotation === 90 || this.rotation === 270) {
      if (direction === Direction.LEFT) {
        const x = this.x - this.config.grid.cellSize / 2
        const y = this.y - waterWidth / 2
        this.waterGraphics.fillRect(x, y, waterLength, waterWidth)
        exitPosition = { row: this.gridRow, col: this.gridCol + 1 }
      } else if (direction === Direction.RIGHT) {
        const x = this.x + this.config.grid.cellSize / 2 - waterLength
        const y = this.y - waterWidth / 2
        this.waterGraphics.fillRect(x, y, waterLength, waterWidth)
        exitPosition = { row: this.gridRow, col: this.gridCol - 1 }
      }
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
}
