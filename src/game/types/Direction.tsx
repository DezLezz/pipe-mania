export const Direction = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} as const

export type DirectionValue = (typeof Direction)[keyof typeof Direction]
