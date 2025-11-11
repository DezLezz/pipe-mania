interface MainMenuProps {
  onPlay: () => void
}

export default function MainMenu({ onPlay }: MainMenuProps) {
  return (
    <div className="main-menu">
      <img src="./assets/logo.png" alt="Pipe Mania" className="main-menu__logo" />
      <button onClick={onPlay} className="main-menu__play-button">
        Play
      </button>
    </div>
  )
}
