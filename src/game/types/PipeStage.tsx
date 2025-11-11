export const PipeStage = {
  DRY: 'dry',
  WATER: 'water',
} as const

export type PipeStageValue = (typeof PipeStage)[keyof typeof PipeStage]
