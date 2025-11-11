import { useEffect, useState } from 'react'
import type { GameConfig } from './game/types/GameConfig'
import GameView from './components/GameView'

function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  useEffect(() => {
    // Load game config first
    fetch('./config/gameConfig.json')
      .then((res) => res.json())
      .then((config: GameConfig) => {
        setGameConfig(config)
      })
      .catch((err) => {
        console.error('Failed to load game config:', err)
      })
  }, [])

  if (!gameConfig) {
    return <div>Loading...</div>
  }

  return <GameView gameConfig={gameConfig} />
}

export default App
