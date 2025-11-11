export interface GameConfig {
  grid: { rows: number; cols: number; cellSize: number }
  flow: {
    startDelay: number
    segmentDelay: number
    pipePlacementDelay: number
    minRequiredLength: number
    maxRequiredLength: number
    maxWaterLevel: number
  }
  pieceSet: { type: string; enabled: boolean }[]
  rules: {
    minBlockedCells: number
    maxBlockedCells: number
  }
}
