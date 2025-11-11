export const CellType = {
  EMPTY: 'empty',
  PIPE: 'pipe',
  BLOCKED: 'blocked',
} as const

export type CellTypeValue = (typeof CellType)[keyof typeof CellType]
