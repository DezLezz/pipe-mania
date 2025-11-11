export interface WaterReceiveResult {
  waterReceived: boolean
  isFull: boolean
  nextPosition: { row: number; col: number } | null
  canContinue: boolean
}

