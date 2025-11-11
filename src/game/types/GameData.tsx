export interface GameData {
  elapsedTime: number // in milliseconds
  isWaterFlowing: boolean
  waterPathLength: number
  requiredLength: number
  gameStatus: 'playing' | 'won' | 'lost' | 'paused'
}

