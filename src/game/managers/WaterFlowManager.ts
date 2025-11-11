import Phaser from 'phaser'
import type { GameData } from '../types/GameData'
import { GameState, type GameStateValue } from '../types/GameState'
import { PipePiece } from '../PipePiece'
import type { Cell } from './GridManager'

export class WaterFlowManager {
  private currentPosition: { row: number; col: number }
  private previousPosition: { row: number; col: number }
  private isWaterFlowing: boolean
  private waterPathLength: number
  private gameStatus: GameStateValue
  private onUpdateGameData: (updates: Partial<GameData>) => void

  constructor(
    startingPosition: { row: number; col: number },
    onUpdateGameData: (updates: Partial<GameData>) => void
  ) {
    this.currentPosition = startingPosition
    this.previousPosition = startingPosition
    this.isWaterFlowing = false
    this.waterPathLength = -1
    this.gameStatus = GameState.PLAYING
    this.onUpdateGameData = onUpdateGameData
  }

  getCurrentPosition(): { row: number; col: number } {
    return this.currentPosition
  }

  getPreviousPosition(): { row: number; col: number } {
    return this.previousPosition
  }

  getIsWaterFlowing(): boolean {
    return this.isWaterFlowing
  }

  getWaterPathLength(): number {
    return this.waterPathLength
  }

  getGameStatus(): GameStateValue {
    return this.gameStatus
  }

  startFlow(): void {
    this.isWaterFlowing = true
    this.onUpdateGameData({ isWaterFlowing: true })
  }

  processWaterFlow(scene: Phaser.Scene, gameBoard: Array<Array<Cell>>): void {
    const result = (
      gameBoard[this.currentPosition.row][this.currentPosition.col].pipe as PipePiece
    ).receiveWater(scene, gameBoard, this.previousPosition)

    // If water was successfully added to the pipe
    if (result.waterReceived) {
      // If pipe is full and we can continue to the next position
      // Otherwise, pipe is full but can't continue (blocked or no next pipe or no valid next pipe)
      if (result.isFull && result.canContinue && result.nextPosition) {
        this.waterPathLength++
        this.updateCurrentPosition(result.nextPosition)
        this.onUpdateGameData({ waterPathLength: this.waterPathLength })
      } else if (result.isFull && !result.canContinue) {
        this.isWaterFlowing = false
        this.waterPathLength++
        this.gameStatus = GameState.PAUSED
        this.onUpdateGameData({
          isWaterFlowing: false,
          waterPathLength: this.waterPathLength,
          gameStatus: GameState.PAUSED,
        })
      }
    }
  }

  private updateCurrentPosition(nextPosition: { row: number; col: number }): void {
    this.previousPosition = this.currentPosition
    this.currentPosition = nextPosition
  }
}
