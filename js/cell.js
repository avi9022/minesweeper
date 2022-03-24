function cellClicked(elCell, row, col) {
  //Manual insertion of mines
  if (
    gGame.isManualOn &&
    !gGame.isOn &&
    gLevel.minesAdded.length !== gLevel.MINES
  ) {
    addMineManualy(elCell, row, col)
    return
  }

  // Starting the game
  if (gGame.isFirstMove) {
    if (gGame.isSevenBoom) {
      startTimer()
      gGame.isFirstMove = false
    } else startGame(row, col)
  }

  var cell = gBoard[row][col]
  if (cell.isMarked || cell.isShown || !gGame.isOn) return

  if (gGame.isHintOn) {
    showHint(elCell, row, col)
    gGame.isHintOn = false
    gGame.hintsCount--
    renderHints()
    return
  }

  // Adding the state of the board to the memory array before it changes
  gPrevMoves.push(cloneBoard())

  if (cell.isMine) {
    elCell.innerText = MINE
    elCell.style.backgroundColor = 'rgb(150, 150, 150)'
    gGame.liveCount--
    gGame.minesNotRevealed--
    cell.isShown = true
    if (!gGame.liveCount) gameOver(true)
    renderLives()
    return
  }

  // Render cell's minesAroundCount and update model
  elCell.innerText = cell.minesAroundCount
  elCell.style.backgroundColor = 'rgb(150, 150, 150)'
  elCell.style.color = 'rgb(78, 78, 78)'
  cell.isShown = true
  gGame.shownCount++

  // Open all cells next to current cell the have no neighbors
  if (cell.minesAroundCount === 0) expandShown(gBoard, row, col)

  checkWin()
}

function expandShown(board, row, col) {
  var neighbors = getNeighbors(board, row, col)
  for (var i = 0; i < neighbors.length; i++) {
    var currNeighbor = neighbors[i]
    if (
      currNeighbor.cell.isMine ||
      currNeighbor.cell.isShown ||
      currNeighbor.cell.isMarked
    )
      continue
    currNeighbor.cell.isShown = true
    gGame.shownCount++
    var elCell = document.querySelector(
      `.cell-${currNeighbor.location.i}-${currNeighbor.location.j}`
    )
    elCell.innerText = currNeighbor.cell.minesAroundCount
    elCell.style.backgroundColor = 'rgb(150, 150, 150)'
    elCell.style.color = 'rgb(78, 78, 78)'
    // renderCell(currNeighbor.location, currNeighbor.cell.minesAroundCount)
    if (currNeighbor.cell.minesAroundCount === 0) {
      expandShown(board, currNeighbor.location.i, currNeighbor.location.j)
    }
  }
}

function cellMarked(ev, elCell, row, col) {
  ev.preventDefault()
  var cell = gBoard[row][col]
  if (cell.isShown || (!gGame.isOn && gGame.isManualOn)) return
  if (gGame.isFirstMove) {
    startGame(row, col)
  }
  var cellContent = cell.isMarked ? '' : FLAG
  gGame.markedCount = cell.isMarked
    ? gGame.markedCount - 1
    : gGame.markedCount + 1
  cell.isMarked = !cell.isMarked
  elCell.innerText = cellContent
  checkWin()
}

function showSafeCell() {
  if (gGame.safeClicks === 0 || !gGame.isOn) return
  gGame.safeClicks--
  var emptyCells = getEmptyCells(gBoard)
  var randomCell = getRandomFromArray(emptyCells)
  var location = emptyCells[randomCell]
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)

  var alpha = '1'
  var blinkingCellIntervalId = setInterval(function () {
    alpha = alpha === '1' ? '0.5' : '1'
    elCell.style.backgroundColor = gBoard[location.i][location.j].isShown
      ? `rgba(150, 150, 150,${alpha})`
      : `rgba(78, 78, 78,${alpha})`
  }, 300)

  setTimeout(function () {
    clearInterval(blinkingCellIntervalId)
  }, 2000)
  renderSafeClickCount()
}
