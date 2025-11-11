import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import GameScene from './game/scenes/GameScene'
import PreloadScene from './game/scenes/PreloadScene'
import type { GameConfig } from './game/types/GameConfig'
import type { GameData } from './game/types/GameData'

interface GameComponentProps {
  gameConfig: GameConfig
  onUpdateGameData: (updates: Partial<GameData>) => void
  gameRef: React.MutableRefObject<Phaser.Game | null>
}

export default function GameComponent({
  gameConfig,
  onUpdateGameData,
  gameRef,
}: GameComponentProps) {
  const phaserGameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!phaserGameRef.current || !gameConfig) return

    const canvasWidth =
      gameConfig.grid.cols * gameConfig.grid.cellSize + 2 * gameConfig.grid.cellSize
    const canvasHeight = gameConfig.grid.rows * gameConfig.grid.cellSize

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      backgroundColor: '#1a1a1a',
      parent: phaserGameRef.current,
      scene: [PreloadScene, GameScene],
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: canvasWidth,
        height: canvasHeight,
      },
      callbacks: {
        preBoot: (game: Phaser.Game) => {
          game.registry.set('gameConfig', gameConfig)
          game.registry.set('onUpdateGameData', onUpdateGameData)
        },
      },
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [gameConfig, onUpdateGameData, gameRef])

  return <div ref={phaserGameRef} className="game-holder__canvas" />
}
