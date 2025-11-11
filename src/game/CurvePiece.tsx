import { PipePiece, WATER_WIDTH_RATIO } from './PipePiece'
import { PipeType } from './types/PipeType'
import { PipeStage } from './types/PipeStage'
import { Direction } from './types/Direction'
import type { DirectionValue } from './types/Direction'
import { getDirectionFrom } from './PipeFactory'
import type { BlockPiece } from './BlockPiece'
import type { CellTypeValue } from './types/CellType'
import type { WaterReceiveResult } from './types/WaterReceiveResult'

// Default pipe state is from bottom to right

export class CurvePiece extends PipePiece {
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
      PipeType.CORNER,
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

    // Check if the curve piece can accept water from this direction based on rotation
    // 0°: bottom ↔ right
    // 90°: left ↔ bottom
    // 180°: top ↔ left
    // 270°: right ↔ top

    switch (direction) {
      case Direction.LEFT:
        return this.rotation === 90 || this.rotation === 180
      case Direction.RIGHT:
        return this.rotation === 0 || this.rotation === 270
      case Direction.TOP:
        return this.rotation === 180 || this.rotation === 270
      case Direction.BOTTOM:
        return this.rotation === 0 || this.rotation === 90
      default:
        return false
    }
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
    if (!direction) {
      return {
        waterReceived: false,
        isFull: false,
        nextPosition: null,
        canContinue: false,
      }
    }

    this.waterLevel++
    this.stage = PipeStage.WATER
    if (!this.waterGraphics) {
      this.waterGraphics = scene.add.graphics()
      this.waterGraphics.setDepth(3)
    }

    this.waterGraphics.clear()
    this.waterGraphics.fillStyle(0x00bfff)

    const waterWidth = this.config.grid.cellSize * WATER_WIDTH_RATIO
    const curveThreshold = Math.ceil((this.config.flow.maxWaterLevel * 2) / 3)
    const isFillingExit = this.waterLevel > curveThreshold

    const getExitDirection = (
      rotation: number,
      entryDirection: DirectionValue
    ): DirectionValue | null => {
      if (rotation === 0) {
        return entryDirection === Direction.BOTTOM ? Direction.RIGHT : Direction.BOTTOM
      } else if (rotation === 90) {
        return entryDirection === Direction.LEFT ? Direction.BOTTOM : Direction.LEFT
      } else if (rotation === 180) {
        return entryDirection === Direction.TOP ? Direction.LEFT : Direction.TOP
      } else if (rotation === 270) {
        return entryDirection === Direction.RIGHT ? Direction.TOP : Direction.RIGHT
      }
      return null
    }

    const exitDirection = getExitDirection(this.rotation, direction)

    // Curve pipe is filled in 3 parts to account for L shape
    const incomingLength = !isFillingExit
      ? (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * this.waterLevel
      : (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * (curveThreshold - 1)
    if (direction === Direction.TOP) {
      const x = this.x - waterWidth / 2
      const y = this.y - this.config.grid.cellSize / 2
      this.waterGraphics.fillRect(x, y, waterWidth, incomingLength)
    } else if (direction === Direction.BOTTOM) {
      const x = this.x - waterWidth / 2
      const y = this.y + this.config.grid.cellSize / 2 - incomingLength
      this.waterGraphics.fillRect(x, y, waterWidth, incomingLength)
    } else if (direction === Direction.LEFT) {
      const x = this.x - this.config.grid.cellSize / 2
      const y = this.y - waterWidth / 2
      this.waterGraphics.fillRect(x, y, incomingLength, waterWidth)
    } else if (direction === Direction.RIGHT) {
      const x = this.x + this.config.grid.cellSize / 2 - incomingLength
      const y = this.y - waterWidth / 2
      this.waterGraphics.fillRect(x, y, incomingLength, waterWidth)
    }

    if (isFillingExit) {
      const exitLength =
        (this.config.grid.cellSize / this.config.flow.maxWaterLevel) *
        (this.waterLevel - curveThreshold + 1)

      if (exitDirection === Direction.TOP) {
        const x = this.x - waterWidth / 2
        const y = this.y - this.config.grid.cellSize / 2
        this.waterGraphics.fillRect(x, y, waterWidth, exitLength)
      } else if (exitDirection === Direction.BOTTOM) {
        const x = this.x - waterWidth / 2
        const y = this.y + this.config.grid.cellSize / 2 - exitLength
        this.waterGraphics.fillRect(x, y, waterWidth, exitLength)
      } else if (exitDirection === Direction.LEFT) {
        const x = this.x - this.config.grid.cellSize / 2
        const y = this.y - waterWidth / 2
        this.waterGraphics.fillRect(x, y, exitLength, waterWidth)
      } else if (exitDirection === Direction.RIGHT) {
        const x = this.x + this.config.grid.cellSize / 2 - exitLength
        const y = this.y - waterWidth / 2
        this.waterGraphics.fillRect(x, y, exitLength, waterWidth)
      }
    }

    const isFull = this.waterLevel === this.config.flow.maxWaterLevel
    let nextPosition: { row: number; col: number } | null = null
    let canContinue = false

    if (isFull) {
      let exitPosition = { row: this.gridRow - 1, col: this.gridCol }
      if (exitDirection === Direction.TOP) {
        exitPosition = { row: this.gridRow - 1, col: this.gridCol }
      } else if (exitDirection === Direction.BOTTOM) {
        exitPosition = { row: this.gridRow + 1, col: this.gridCol }
      } else if (exitDirection === Direction.LEFT) {
        exitPosition = { row: this.gridRow, col: this.gridCol - 1 }
      } else if (exitDirection === Direction.RIGHT) {
        exitPosition = { row: this.gridRow, col: this.gridCol + 1 }
      }

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
