import Phaser from 'phaser'
import type { GameConfig } from '../types/GameConfig'
import { PipePiece } from '../PipePiece'
import type { PipeTypeValue } from '../types/PipeType'
import { PipeStage } from '../types/PipeStage'
import { createPipePiece } from '../PipeFactory'

export class PipeOptionsManager {
  private scene: Phaser.Scene
  private cellSize: number
  private pipeOptions: Array<PipePiece>
  private validPipeOptions: Array<PipeTypeValue>
  private optionsStartX: number
  private optionsStartY: number

  constructor(scene: Phaser.Scene, config: GameConfig, cellSize: number) {
    this.scene = scene
    this.cellSize = cellSize
    this.pipeOptions = []
    this.optionsStartX = this.cellSize / 2
    this.optionsStartY = this.cellSize / 2

    this.validPipeOptions = config.pieceSet
      .filter((piece) => piece.enabled)
      .map((piece) => piece.type as PipeTypeValue)
  }

  initialize(): void {
    for (let i = 0; i < 4; i++) {
      this.addPipeOption()
    }
    this.drawNextPipeBorder()
  }

  hasPipes(): boolean {
    return this.pipeOptions.length > 0
  }

  takeFirstPipe(): PipePiece | undefined {
    return this.pipeOptions.shift()
  }

  addPipeOption(): void {
    const pipeType = this.validPipeOptions[Math.floor(Math.random() * this.validPipeOptions.length)]
    const rotation = Math.floor(Math.random() * 4) * 90

    const index = this.pipeOptions.length
    const screenX = this.optionsStartX
    const screenY = this.optionsStartY + (3 - index) * this.cellSize

    const pipe = createPipePiece(
      this.scene,
      0,
      0,
      pipeType,
      PipeStage.DRY,
      rotation,
      this.cellSize,
      0,
      0
    )
    pipe.sprite.setPosition(screenX, screenY)

    this.pipeOptions.push(pipe)
  }

  updateDisplay(): void {
    for (let i = 0; i < this.pipeOptions.length; i++) {
      const screenY = this.optionsStartY + (3 - i) * this.cellSize
      const sprite = this.pipeOptions[i].sprite

      sprite.setX(this.optionsStartX)

      // Falling effect animation
      this.scene.tweens.add({
        targets: sprite,
        y: screenY,
        duration: 200,
        ease: 'Power2',
      })
    }
  }

  private drawNextPipeBorder(): void {
    this.scene.add
      .graphics()
      .lineStyle(2, 0x30f030, 1)
      .strokeRect(1, 1 + this.cellSize * 3, this.cellSize - 1, this.cellSize - 1)
      .setDepth(1000)
  }
}
