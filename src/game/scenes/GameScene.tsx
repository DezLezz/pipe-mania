import Phaser from 'phaser'
import type { GameConfig } from '../types/GameConfig'
import { CellType } from '../types/CellType'
import { PipePiece } from '../PipePiece'
import { PipeType } from '../types/PipeType'
import { convertGridToScreenCoordinates } from '../utils'
import type { GameData } from '../types/GameData'
import { GameState } from '../types/GameState'
import { GridManager } from '../managers/GridManager'
import { PipeOptionsManager } from '../managers/PipeOptionsManager'
import { WaterFlowManager } from '../managers/WaterFlowManager'
import { TimeManager } from '../managers/TimeManager'
import { HoverManager } from '../managers/HoverManager'

export default class GameScene extends Phaser.Scene {
  private gridManager!: GridManager
  private pipeOptionsManager!: PipeOptionsManager
  private waterFlowManager!: WaterFlowManager
  private timeManager!: TimeManager
  private hoverManager!: HoverManager
  private onUpdateGameData!: (updates: Partial<GameData>) => void

  constructor() {
    super('GameScene')
  }

  create() {
    const config = this.registry.get('gameConfig') as GameConfig
    this.onUpdateGameData = this.registry.get('onUpdateGameData') as (
      updates: Partial<GameData>
    ) => void
    this.gridManager = new GridManager(this, config)
    this.timeManager = new TimeManager(config, this.onUpdateGameData)
    this.pipeOptionsManager = new PipeOptionsManager(this, config, this.gridManager.getCellSize())

    const startingPosition = this.gridManager.generateStartingPosition(config)
    this.waterFlowManager = new WaterFlowManager(startingPosition, this.onUpdateGameData)

    this.hoverManager = new HoverManager(
      this,
      this.gridManager.getCellSize(),
      this.gridManager.getStartX(),
      this.gridManager.getStartY()
    )

    const blockedCellsCount = this.gridManager.calculateBlockedCellsCount(config)
    const validPositions = this.gridManager.createGridTilesAndGetValidPositions(
      config,
      startingPosition,
      (col, row) => this.handleTileClick(col, row),
      (col, row) => this.hoverManager.setHoveredCell(row, col),
      () => this.hoverManager.clearHoveredCell()
    )

    this.gridManager.addStartingPosition(startingPosition)
    this.gridManager.addBlockedCells(validPositions, blockedCellsCount)

    this.pipeOptionsManager.initialize()
  }

  update(_time: number, delta: number) {
    if (this.waterFlowManager.getGameStatus() === GameState.PAUSED) {
      return
    }

    this.timeManager.update(delta)

    // Start the water flow
    if (this.timeManager.shouldStartWaterFlow(this.waterFlowManager.getIsWaterFlowing())) {
      this.timeManager.setLastWaterSegmentTime(this.timeManager.getElapsedTime())
      this.waterFlowManager.startFlow()
    }

    // Process water flow with segment delay
    if (this.timeManager.shouldProcessWaterFlow(this.waterFlowManager.getIsWaterFlowing())) {
      this.timeManager.setLastWaterSegmentTime(this.timeManager.getElapsedTime())
      this.waterFlowManager.processWaterFlow(this, this.gridManager.getGameBoard())
    }
  }

  private handleTileClick(col: number, row: number): void {
    const cell = this.gridManager.getCell(row, col)
    const cellIsEmpty = cell.type === CellType.EMPTY
    const cellIsReplaceablePipe =
      cell.type === CellType.PIPE &&
      (cell.pipe as PipePiece).type !== PipeType.START &&
      (cell.pipe as PipePiece).canBeReplacedBy()

    // Check if cell is empty and we have pipe options
    if (
      (cellIsEmpty || cellIsReplaceablePipe) &&
      this.pipeOptionsManager.hasPipes() &&
      this.timeManager.canPlacePipe()
    ) {
      // Get and remove the first pipe option
      const pipe = this.pipeOptionsManager.takeFirstPipe()
      if (!pipe) return

      // Update pipe to game board location
      pipe.gridCol = col
      pipe.gridRow = row
      const screenCoords = convertGridToScreenCoordinates(
        col,
        row,
        this.gridManager.getCellSize(),
        this.gridManager.getStartX(),
        this.gridManager.getStartY()
      )
      pipe.x = screenCoords.x
      pipe.y = screenCoords.y
      pipe.sprite.setPosition(screenCoords.x, screenCoords.y)

      // Delete the old pipe
      if (cellIsReplaceablePipe) {
        ;(cell.pipe as PipePiece).destroy()
      }

      // Add to game board
      this.gridManager.setCell(row, col, {
        type: CellType.PIPE,
        pipe: pipe,
      })

      // Add new random pipe to the end
      this.pipeOptionsManager.addPipeOption()

      // Shift remaining options down visually
      this.pipeOptionsManager.updateDisplay()

      this.timeManager.recordPipePlacement()
    }
  }
}
