export interface GameConfig {
  grid: { rows: number; cols: number; cellSize: number }
  flow: {
    startDelay: number
    segmentDelay: number
    pipePlacementDelay: number
    speedMultiplier: number
    minRequiredLength: number
    maxRequiredLength: number
    maxWaterLevel: number
  }
  pieceSet: { type: string; enabled: boolean }[]
  rules: {
    allowReplace: boolean
    minBlockedCells: number
    maxBlockedCells: number
    randomStart: number
  }
}
