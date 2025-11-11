export const PipeType = {
  STRAIGHT: 'straight',
  CORNER: 'corner',
  CROSS: 'cross',
  START: 'start',
} as const

export type PipeTypeValue = (typeof PipeType)[keyof typeof PipeType]
