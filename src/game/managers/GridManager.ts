import Phaser from 'phaser'
import type { GameConfig } from '../types/GameConfig'
import { CellType, type CellTypeValue } from '../types/CellType'
import { PipePiece } from '../PipePiece'
import { PipeType } from '../types/PipeType'
import { BlockPiece } from '../BlockPiece'
import { convertGridToScreenCoordinates, shuffleArray } from '../utils'
import { PipeStage } from '../types/PipeStage'

export type Cell = { type: CellTypeValue; pipe?: PipePiece | BlockPiece }

export class GridManager {
  private scene: Phaser.Scene
  private cellSize: number
  private startX!: number
  private startY!: number
  private gameBoard: Array<Array<Cell>>

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.scene = scene
    this.cellSize = config.grid.cellSize
    this.calculateGridPosition()

    this.gameBoard = Array.from({ length: config.grid.rows }, () =>
      Array.from({ length: config.grid.cols }, () => {
        return { type: CellType.EMPTY }
      })
    )
  }

  getCellSize(): number {
    return this.cellSize
  }

  getStartX(): number {
    return this.startX
  }

  getStartY(): number {
    return this.startY
  }

  getGameBoard(): Array<Array<Cell>> {
    return this.gameBoard
  }

  getCell(row: number, col: number): Cell {
    return this.gameBoard[row][col]
  }

  setCell(row: number, col: number, cell: Cell): void {
    this.gameBoard[row][col] = cell
  }

  private calculateGridPosition(): void {
    // Grid starts at x = 2 * cellSize, y = 0
    this.startX = 2 * this.cellSize
    this.startY = 0
  }

  generateStartingPosition(config: GameConfig): { row: number; col: number } {
    return {
      col: Math.floor(Math.random() * config.grid.cols),
      row: Math.floor(Math.random() * (config.grid.rows - 1)), // -1 to avoid the last row
    }
  }

  calculateBlockedCellsCount(config: GameConfig): number {
    return (
      Math.floor(Math.random() * (config.rules.maxBlockedCells - config.rules.minBlockedCells)) +
      config.rules.minBlockedCells
    )
  }

  createGridTilesAndGetValidPositions(
    config: GameConfig,
    startingPosition: { row: number; col: number },
    onTileClick: (col: number, row: number) => void,
    onTileHover: (col: number, row: number) => void,
    onTileOut: () => void
  ): Array<{ row: number; col: number }> {
    const validPositions: Array<{ row: number; col: number }> = []

    for (let row = 0; row < config.grid.rows; row++) {
      for (let col = 0; col < config.grid.cols; col++) {
        const gridPosition = convertGridToScreenCoordinates(
          col,
          row,
          this.cellSize,
          this.startX,
          this.startY
        )
        const gameTile = this.scene.add.image(gridPosition.x, gridPosition.y, 'game_tile')
        gameTile.setDepth(1)
        this.addTileActions(gameTile, col, row, onTileClick, onTileHover, onTileOut)

        // Collect valid positions for blocked cells (excludes starting position and cell directly below it)
        if (
          !(col === startingPosition.col && row === startingPosition.row) &&
          !(col === startingPosition.col && row === startingPosition.row + 1)
        ) {
          validPositions.push({ row: row, col: col })
        }
      }
    }

    // Shuffle valid positions to randomize the placement of blocked cells
    return shuffleArray(validPositions)
  }

  addStartingPosition(startingPosition: { row: number; col: number }): void {
    const startPipe = new PipePiece(
      this.scene,
      startingPosition.col,
      startingPosition.row,
      PipeType.START,
      PipeStage.DRY,
      0, // Start pipe always points downward
      this.cellSize,
      this.startX,
      this.startY
    )
    this.gameBoard[startingPosition.row][startingPosition.col] = {
      type: CellType.PIPE,
      pipe: startPipe,
    }
  }

  addBlockedCells(
    validPositions: Array<{ row: number; col: number }>,
    blockedCellsCount: number
  ): void {
    for (let i = 0; i < blockedCellsCount; i++) {
      const pos = validPositions[i]
      this.gameBoard[pos.row][pos.col] = {
        type: CellType.BLOCKED,
        pipe: new BlockPiece(this.scene, pos.col, pos.row, this.cellSize, this.startX, this.startY),
      }
    }
  }

  private addTileActions(
    gameTile: Phaser.GameObjects.Image,
    col: number,
    row: number,
    onTileClick: (col: number, row: number) => void,
    onTileHover: (col: number, row: number) => void,
    onTileOut: () => void
  ): void {
    gameTile.setInteractive()
    gameTile.on('pointerdown', () => onTileClick(col, row))
    gameTile.on('pointerover', () => onTileHover(col, row))
    gameTile.on('pointerout', () => onTileOut())
  }
}
