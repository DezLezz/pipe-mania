import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.spritesheet('pipesPixel', './assets/pipes_tileset.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.image('game_tile', './assets/game_tile.png')
    this.load.image('blocked_tile', './assets/blocked_tile.png')

    const { width, height } = this.cameras.main
    const loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      color: '#fff',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
    })
    loadingText.setOrigin(0.5, 0.5)
    this.load.on('complete', () => loadingText.setText('Ready!'))
  }

  create() {
    this.scene.start('GameScene')
  }
}
