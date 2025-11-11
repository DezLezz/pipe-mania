import type { PipeTypeValue } from './types/PipeType'
import type { PipeStageValue } from './types/PipeStage'
import { PipeType } from './types/PipeType'
import { PipeStage } from './types/PipeStage'
import { PIPE_SPRITES } from './data/PipeSprites'
import { convertGridToScreenCoordinates } from './utils'
import type { GameConfig } from './types/GameConfig'
import type { CellTypeValue } from './types/CellType'
import { BlockPiece } from './BlockPiece'
import type { WaterReceiveResult } from './types/WaterReceiveResult'

export const WATER_WIDTH_RATIO = 1 / 3

export class PipePiece {
  sprite: Phaser.GameObjects.Image
  type: PipeTypeValue
  stage: PipeStageValue
  rotation: number
  gridCol: number
  gridRow: number
  x: number
  y: number
  config: GameConfig
  waterLevel: number = 0
  waterGraphics: Phaser.GameObjects.Graphics | null = null

  constructor(
    scene: Phaser.Scene,
    gridCol: number,
    gridRow: number,
    type: PipeTypeValue,
    stage: PipeStageValue,
    rotation: number,
    cellSize: number,
    startX: number,
    startY: number
  ) {
    this.config = scene.registry.get('gameConfig') as GameConfig
    this.type = type
    this.stage = stage
    this.rotation = rotation
    this.gridCol = gridCol
    this.gridRow = gridRow

    const screenCoords = convertGridToScreenCoordinates(gridCol, gridRow, cellSize, startX, startY)
    this.x = screenCoords.x
    this.y = screenCoords.y

    const frame = PIPE_SPRITES[type]
    this.sprite = scene.add.image(this.x, this.y, 'pipesPixel', frame)
    this.sprite.setOrigin(0.5)
    this.sprite.angle = rotation
    this.sprite.setDepth(5)
  }

  setStage(stage: PipeStageValue) {
    this.stage = stage
    this.sprite.setFrame(PIPE_SPRITES[this.type])
  }

  setOpacity(opacity: number) {
    this.sprite.setAlpha(opacity)
  }

  destroy() {
    this.sprite.destroy()
    if (this.waterGraphics) {
      this.waterGraphics.destroy()
      this.waterGraphics = null
    }
  }

  canReceiveWaterFrom(pipe: PipePiece) {
    if (pipe.gridCol !== this.gridCol && pipe.gridRow !== this.gridRow) {
      return false
    }

    if (this.stage === PipeStage.WATER) {
      return false
    }

    return true
  }

  canBeReplacedBy() {
    return this.stage === PipeStage.DRY
  }

  receiveWater(
    scene: Phaser.Scene,
    gameBoard: Array<Array<{ type: CellTypeValue; pipe?: PipePiece | BlockPiece }>>,
    _previousPosition: { row: number; col: number }
  ): WaterReceiveResult {
    if (this.waterLevel >= this.config.flow.maxWaterLevel) {
      return {
        waterReceived: false,
        isFull: true,
        nextPosition: null,
        canContinue: false,
      }
    }

    // Previous position can be ignored for start pipe
    if (this.type === PipeType.START) {
      this.waterLevel++
      this.stage = PipeStage.WATER
      if (!this.waterGraphics) {
        this.waterGraphics = scene.add.graphics()
        this.waterGraphics.setDepth(3)
      }

      this.waterGraphics.clear()
      this.waterGraphics.fillStyle(0x00bfff)

      const height = (this.config.grid.cellSize / this.config.flow.maxWaterLevel) * this.waterLevel
      const width = this.config.grid.cellSize * WATER_WIDTH_RATIO
      const x = this.x - width / 2
      const y = this.y - this.config.grid.cellSize / 2

      this.waterGraphics.fillRect(x, y, width, height)

      const isFull = this.waterLevel === this.config.flow.maxWaterLevel
      let nextPosition: { row: number; col: number } | null = null
      let canContinue = false

      if (isFull) {
        const nextPipe = gameBoard[this.gridRow + 1]?.[this.gridCol]?.pipe
        if (nextPipe instanceof PipePiece) {
          if (nextPipe.canReceiveWaterFrom(this)) {
            nextPosition = { row: this.gridRow + 1, col: this.gridCol }
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

    return {
      waterReceived: false,
      isFull: false,
      nextPosition: null,
      canContinue: false,
    }
  }

  checkForBlockOrBorder(
    gameBoard: Array<Array<{ type: CellTypeValue; pipe?: PipePiece | BlockPiece }>>,
    position: { row: number; col: number }
  ) {
    if (
      position.row < 0 ||
      position.row >= gameBoard.length ||
      position.col < 0 ||
      position.col >= gameBoard[0].length
    ) {
      return true
    }
    const cell = gameBoard[position.row][position.col]
    if (cell.pipe instanceof BlockPiece) {
      return true
    }
    return false
  }
}
