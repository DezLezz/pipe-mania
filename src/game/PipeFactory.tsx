import { PipePiece } from './PipePiece'
import { StraightPiece } from './StraightPiece'
import { CurvePiece } from './CurvePiece'
import { CrossPiece } from './CrossPiece'
import type { PipeTypeValue } from './types/PipeType'
import type { PipeStageValue } from './types/PipeStage'
import type { DirectionValue } from './types/Direction'
import { Direction } from './types/Direction'
import { PipeType } from './types/PipeType'

export function getDirectionFrom(from: PipePiece, to: PipePiece): DirectionValue | null {
  if (from.gridCol === to.gridCol) {
    // Same column - coming from top or bottom
    if (from.gridRow < to.gridRow) {
      return Direction.TOP
    } else if (from.gridRow > to.gridRow) {
      return Direction.BOTTOM
    }
  } else if (from.gridRow === to.gridRow) {
    // Same row - coming from left or right
    if (from.gridCol < to.gridCol) {
      return Direction.LEFT
    } else if (from.gridCol > to.gridCol) {
      return Direction.RIGHT
    }
  }
  return null
}

export function createPipePiece(
  scene: Phaser.Scene,
  gridCol: number,
  gridRow: number,
  type: PipeTypeValue,
  stage: PipeStageValue,
  rotation: number,
  cellSize: number,
  startX: number,
  startY: number
): PipePiece {
  switch (type) {
    case PipeType.STRAIGHT:
      return new StraightPiece(scene, gridCol, gridRow, cellSize, startX, startY, rotation)
    case PipeType.CORNER:
      return new CurvePiece(scene, gridCol, gridRow, cellSize, startX, startY, rotation)
    case PipeType.CROSS:
      return new CrossPiece(scene, gridCol, gridRow, cellSize, startX, startY, rotation)
    default:
      // For START or any other type, use base PipePiece
      return new PipePiece(scene, gridCol, gridRow, type, stage, rotation, cellSize, startX, startY)
  }
}
