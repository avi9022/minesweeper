function addMines(clickedRow, clickedCol) {
  if (gGame.isManualOn) {
    return
  }

  // Adding mines to 7Boom! game
  if (gGame.isSevenBoom) {
    for (var i = 1; i < gLevel.SIZE ** 2 - 1; i++) {
      if (i % 7 === 0 || (i + '').includes('7')) {
        var row = Math.floor(i / gLevel.SIZE)
        var col = i - row * gLevel.SIZE - 1
        if (i % gLevel.SIZE === 0) {
          row--
          col = gLevel.SIZE - 1
        }
        gBoard[row][col].isMine = true
        gLevel.minesAdded.push({ i: row, j: col })
        setMinesNegsCount({ i: row, j: col })
      }
    }
    return
  }

  // Adding mines to regular game
  var emptyCells = getEmptyCellsExcept(gBoard, clickedRow, clickedCol)
  for (var i = 0; i < gLevel.MINES; i++) {
    var randEmptyCellIdx = getRandomFromArray(emptyCells)
    var location = emptyCells[randEmptyCellIdx]
    gBoard[location.i][location.j].isMine = true
    gLevel.minesAdded.push(location)
    setMinesNegsCount(location)
    emptyCells.splice(randEmptyCellIdx, 1)
  }
}

function setMinesNegsCount(mineCellLocation) {
  var neighbors = getNeighbors(gBoard, mineCellLocation.i, mineCellLocation.j)
  for (var i = 0; i < neighbors.length; i++) {
    neighbors[i].cell.minesAroundCount++
  }
}

function addMineManualy(elCell, row, col) {
  gBoard[row][col].isMine = true
  elCell.innerText = MINE
  gLevel.minesAdded.push(elCell)
  setMinesNegsCount({ i: row, j: col })
  if (gLevel.minesAdded.length === gLevel.MINES) {
    setTimeout(function () {
      for (var i = 0; i < gLevel.minesAdded.length; i++) {
        var currMine = gLevel.minesAdded[i]
        currMine.innerText = ''
      }
    }, 500)
  }
}

function showAllMines(minesLocations) {
  for (var i = 0; i < minesLocations.length; i++) {
    renderCell(minesLocations[i], MINE)
  }
}
