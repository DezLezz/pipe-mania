function convertGridToScreenCoordinates(
  gridCol: number,
  gridRow: number,
  cellSize: number,
  startX: number,
  startY: number
) {
  return {
    x: startX + gridCol * cellSize + cellSize / 2,
    y: startY + gridRow * cellSize + cellSize / 2,
  }
}

function getRandomRotation() {
  return Math.floor(Math.random() * 4) * 90
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array: Array<{ row: number; col: number }>) {
  let m = array.length,
    t,
    i

  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }

  return array
}

export { convertGridToScreenCoordinates, getRandomRotation, shuffleArray }
