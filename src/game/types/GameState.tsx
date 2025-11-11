export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  OVER: 'over',
} as const

export type GameStateValue = (typeof GameState)[keyof typeof GameState]
