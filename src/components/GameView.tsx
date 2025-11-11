import { useState, useCallback, useRef } from 'react'
import type { GameConfig } from '../game/types/GameConfig'
import { GameState, type GameStateValue } from '../game/types/GameState'
import type { GameData } from '../game/types/GameData'
import GameComponent from '../GameComponent'
import MainMenu from './MainMenu'
import type Phaser from 'phaser'

interface GameViewProps {
  gameConfig: GameConfig
}

export default function GameView({ gameConfig }: GameViewProps) {
  const gameRef = useRef<Phaser.Game | null>(null)
  const [gameState, setGameState] = useState<GameStateValue>(GameState.MENU)
  const [gameData, setGameData] = useState<GameData>({
    elapsedTime: 0,
    isWaterFlowing: false,
    waterPathLength: 0,
    requiredLength: 0,
    gameStatus: 'playing',
  })

  const updateGameData = useCallback((updates: Partial<GameData>) => {
    setGameData((prev) => ({ ...prev, ...updates }))

    // If water flow is stopped, check if the path length is greater than or equal to the required length
    if (
      !updates.isWaterFlowing &&
      updates.waterPathLength !== undefined &&
      updates.gameStatus === GameState.PAUSED
    ) {
      setGameState(GameState.OVER)

      setTimeout(() => {
        handleBackToMenu()
      }, 5000)
    }
  }, [])

  const handlePlay = () => {
    setGameState(GameState.PLAYING)
    // Reset game data
    setGameData({
      elapsedTime: 0,
      isWaterFlowing: false,
      waterPathLength: 0,
      requiredLength:
        Math.floor(
          Math.random() * (gameConfig.flow.maxRequiredLength - gameConfig.flow.minRequiredLength)
        ) + gameConfig.flow.minRequiredLength,
      gameStatus: 'playing',
    })
  }

  const handleBackToMenu = () => {
    setGameState(GameState.MENU)
  }

  if (gameState === GameState.MENU) {
    return <MainMenu onPlay={handlePlay} />
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
  }

  const waterFlowStatus = gameData.isWaterFlowing ? (
    <div className="game-holder__info-value--green">ON</div>
  ) : (
    <div className="game-holder__info-value--red">OFF</div>
  )

  const currentLengthStatus =
    gameData.waterPathLength >= gameData.requiredLength ? (
      <div className="game-holder__info-value--green">{gameData.waterPathLength}</div>
    ) : (
      <div className="game-holder__info-value--red">{gameData.waterPathLength}</div>
    )

  return (
    <div className="game-holder">
      {gameState === GameState.OVER && (
        <div className="game-holder__over-holder">
          <div className="game-holder__over-content">
            <div className="game-holder__over-text">
              You {gameData.waterPathLength >= gameData.requiredLength ? 'Won!' : 'Lost'}{' '}
            </div>
            <div className="game-holder__over-description">
              You got a total length of {gameData.waterPathLength} out of {gameData.requiredLength}
            </div>
          </div>
        </div>
      )}
      <div className="game-holder__ui game-holder__info-holder">
        <div className="game-holder__info-col">
          <div className="game-holder__info-value">Time: {formatTime(gameData.elapsedTime)}</div>
          <div className="game-holder__info-value">Water Flow: {waterFlowStatus}</div>
        </div>
        <div className="game-holder__info-col">
          <div className="game-holder__info-value">Current Length: {currentLengthStatus}</div>
          <div className="game-holder__info-value">Goal: {gameData.requiredLength}</div>
        </div>
      </div>
      <div className="game-holder__canvas-holder">
        <GameComponent
          gameConfig={gameConfig}
          onUpdateGameData={updateGameData}
          gameRef={gameRef}
        />
      </div>
      <div className="game-holder__button-holder">
        <button onClick={handleBackToMenu} className="main-menu__play-button">
          Menu
        </button>
      </div>
    </div>
  )
}
