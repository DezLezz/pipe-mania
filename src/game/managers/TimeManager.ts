import type { GameConfig } from '../types/GameConfig'
import type { GameData } from '../types/GameData'

export class TimeManager {
  private elapsedTime: number
  private lastReactUpdateTime: number
  private startDelay: number
  private segmentDelay: number
  private pipePlacementDelay: number
  private pipeLastPlacedTime: number
  private lastWaterSegmentTime: number
  private onUpdateGameData: (updates: Partial<GameData>) => void

  constructor(config: GameConfig, onUpdateGameData: (updates: Partial<GameData>) => void) {
    this.elapsedTime = 0
    this.lastReactUpdateTime = 0
    this.startDelay = config.flow.startDelay
    this.segmentDelay = config.flow.segmentDelay
    this.pipePlacementDelay = config.flow.pipePlacementDelay
    this.pipeLastPlacedTime = 0
    this.lastWaterSegmentTime = 0
    this.onUpdateGameData = onUpdateGameData
  }

  update(delta: number): void {
    this.elapsedTime += delta

    // Update React state every 100ms
    if (this.elapsedTime - this.lastReactUpdateTime >= 100) {
      this.onUpdateGameData({ elapsedTime: Math.floor(this.elapsedTime) })
      this.lastReactUpdateTime = this.elapsedTime
    }
  }

  getElapsedTime(): number {
    return this.elapsedTime
  }

  getStartDelay(): number {
    return this.startDelay
  }

  getSegmentDelay(): number {
    return this.segmentDelay
  }

  getPipePlacementDelay(): number {
    return this.pipePlacementDelay
  }

  getLastWaterSegmentTime(): number {
    return this.lastWaterSegmentTime
  }

  setLastWaterSegmentTime(time: number): void {
    this.lastWaterSegmentTime = time
  }

  canPlacePipe(): boolean {
    return this.elapsedTime - this.pipeLastPlacedTime > this.pipePlacementDelay
  }

  recordPipePlacement(): void {
    this.pipeLastPlacedTime = this.elapsedTime
  }

  shouldStartWaterFlow(isWaterFlowing: boolean): boolean {
    return this.elapsedTime > this.startDelay && !isWaterFlowing
  }

  shouldProcessWaterFlow(isWaterFlowing: boolean): boolean {
    return isWaterFlowing && this.elapsedTime - this.lastWaterSegmentTime >= this.segmentDelay
  }
}
