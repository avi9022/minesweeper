'use strict'

// Game icons
const MINE = '💣'
const FLAG = '🚩'
const HEART = '💖'
const HINT = '💡'

// Global game variables
var gBoard
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  isFirstMove: true,
  liveCount: 3,
  hintsCount: 3,
  isHintOn: false,
  safeClicks: 3,
  isSevenBoom: false,
  minesNotRevealed: 0,
  isManualOn: false,
}
var gLevel = {
  SIZE: 4,
  MINES: 2,
  minesAdded: [],
}
var gPrevMoves = []

// Timer
var gGameTimerIdx
var gSecs = 0
var gMins = 0
var gElSecsLable = document.querySelector('.timer .secs')
var gElMinsLable = document.querySelector('.timer .mins')

// Best score elements
var gElEasyMins = document.querySelector('.best-score .easy .mins')
var gElEasySecs = document.querySelector('.best-score .easy .secs')
var gElMediumMins = document.querySelector('.best-score .medium .mins')
var gElMediumSecs = document.querySelector('.best-score .medium .secs')
var gElExtremeMins = document.querySelector('.best-score .extreme .mins')
var gElExtremeSecs = document.querySelector('.best-score .extreme .secs')

function init() {
  var cellCount = gLevel.SIZE
  gBoard = createMat(cellCount, cellCount)
  printMat(gBoard, '.container', 400 / gLevel.SIZE)
  renderLives()
  renderHints()
  renderBestScores()
  gGame.minesNotRevealed = gLevel.MINES

  if (gGame.isSevenBoom) {
    addMines()
    gGame.isFirstMove = false
    gGame.isOn = true
  }
}

function changeDifficulty(SIZE, MINES) {
  gLevel = {
    SIZE,
    MINES,
    minesAdded: [],
  }

  clearInterval(gGameTimerIdx)
  restartGame()
}

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

  if (gGame.isFirstMove) {
    startGame(row, col)
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
    renderCell({ i: row, j: col }, MINE)
    gGame.liveCount--
    gGame.minesNotRevealed--
    cell.isShown = true
    if (!gGame.liveCount) gameOver(true)
    renderLives()
    return
  }

  // Render cell's minesAroundCount and update model
  elCell.innerText = cell.minesAroundCount
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
    renderCell(currNeighbor.location, currNeighbor.cell.minesAroundCount)
    if (currNeighbor.cell.minesAroundCount === 0) {
      expandShown(board, currNeighbor.location.i, currNeighbor.location.j)
    }
  }
}

function startGame(clickedRow, clickedCol) {
  gGame.isOn = true
  gGame.isFirstMove = false
  addMines(clickedRow, clickedCol)
  startTimer()
}

function addMines(clickedRow, clickedCol) {
  if (gGame.isManualOn) {
    return
  }
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
        setMinesNegsCount({ i: row, j: col })
      }
    }
    return
  }

  var emptyCells = getEmptyCellsExcept(gBoard, clickedRow, clickedCol)
  for (var i = 0; i < gLevel.MINES; i++) {
    var randEmptyCellIdx = getRandomFromArray(emptyCells)
    var location = emptyCells[randEmptyCellIdx]
    gBoard[location.i][location.j].isMine = true
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

function startTimer() {
  gGameTimerIdx = setInterval(function () {
    gSecs += 1
    if (gSecs > 59) {
      gMins++
      gSecs = 0
    }
    var secsStr = (gSecs + '').padStart(2, '0')
    var minsStr = (gMins + '').padStart(2, '0')
    gElSecsLable.innerText = secsStr
    gElMinsLable.innerText = minsStr
  }, 1000)
}

function cellMarked(ev, elCell, row, col) {
  ev.preventDefault()
  var cell = gBoard[row][col]
  if (cell.isShown || (!gGame.isOn && (gGame.isFirstMove || gGame.isManualOn)))
    return
  var cellContent = cell.isMarked ? '' : FLAG
  gGame.markedCount = cell.isMarked
    ? gGame.markedCount - 1
    : gGame.markedCount + 1
  cell.isMarked = !cell.isMarked
  elCell.innerText = cellContent
  checkWin()
}

function checkWin() {
  var safeCells = gLevel.SIZE ** 2 - gLevel.MINES
  if (
    gGame.shownCount === safeCells &&
    gGame.markedCount === gGame.minesNotRevealed
  ) {
    gameOver(false)
  }
}

function gameOver(isLost) {
  gGame.isOn = false
  var elSmiley = document.querySelector('.smiley')
  elSmiley.innerText = isLost ? '😭' : '😎'
  var msg = isLost ? 'You Lost!' : 'You Won!'
  openModal('.modal', msg)
  clearInterval(gGameTimerIdx)
  if (!isLost) {
    setBestScore()
    renderBestScores()
  }
}

function restartGame(sevenBoom = false) {
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    isFirstMove: true,
    liveCount: 3,
    hintsCount: 3,
    isHintOn: false,
    safeClicks: 3,
    isSevenBoom: sevenBoom,
    minesNotRevealed: 0,
    isManualOn: gGame.isManualOn,
  }

  gLevel.minesAdded = []

  init()

  //Reset and render timer
  gMins = 0
  gSecs = 0
  gElSecsLable.innerText = '00'
  gElMinsLable.innerText = '00'

  var elSmiley = document.querySelector('.smiley')
  elSmiley.innerText = '😀'
  closeModal('.modal')
}

function renderLives() {
  var elLivesContainer = document.querySelector('.lives')

  var strHTML = '<ul class="inline-list">'
  for (var i = 0; i < gGame.liveCount; i++) {
    strHTML += `<li>${HEART}</li>`
  }
  strHTML += '</ul>'

  elLivesContainer.innerHTML = strHTML
}

function renderHints() {
  var elHintsContainer = document.querySelector('.hints')

  var strHTML = '<ul class="inline-list">'
  for (var i = 0; i < gGame.hintsCount; i++) {
    strHTML += `<li onclick="hint()">${HINT}</li>`
  }
  strHTML += '</ul>'

  elHintsContainer.innerHTML = strHTML
}

function hint() {
  gGame.isHintOn = true
}

function showHint(ellClickedCell, row, col) {
  ellClickedCell.innerText = gBoard[row][col].minesAroundCount
  var neighbors = getNeighbors(gBoard, row, col)
  for (var i = 0; i < neighbors.length; i++) {
    var currCellContent = neighbors[i].cell.isMine
      ? MINE
      : neighbors[i].cell.minesAroundCount
    renderCell(neighbors[i].location, currCellContent)
  }

  setTimeout(function () {
    ellClickedCell.innerText = ''
    for (var i = 0; i < neighbors.length; i++) {
      renderCell(neighbors[i].location, '')
    }
  }, 1000)
}

function setBestScore() {
  var difficulty = 'Easy'

  switch (gLevel.SIZE) {
    case 8:
      difficulty = 'Medium'
      break
    case 12:
      difficulty = 'Extreme'
      break
  }
  var currBestScore = localStorage.getItem(difficulty)
  if (!currBestScore) {
    localStorage.setItem(difficulty, gMins * 60 + gSecs)
    return
  }
  var newScore = gMins * 60 + gSecs
  if (newScore < currBestScore)
    localStorage.setItem(difficulty, gMins * 60 + gSecs)
}

function renderBestScores() {
  // Render easy best score
  var easyBestScore = +localStorage.getItem('Easy')
  if (easyBestScore) {
    var mins = easyBestScore < 59 ? '00' : Math.floor(easyBestScore / 60)
    var secs = easyBestScore < 59 ? easyBestScore : easyBestScore % 60
    gElEasyMins.innerText = (mins + '').padStart(2, '0')
    gElEasySecs.innerText = (secs + '').padStart(2, '0')
  }

  // Render medium best score
  var mediumBestScore = +localStorage.getItem('Medium')
  if (mediumBestScore) {
    mins = mediumBestScore < 59 ? '00' : Math.floor(mediumBestScore / 60)
    secs = mediumBestScore < 59 ? mediumBestScore : mediumBestScore % 60
    gElMediumMins.innerText = (mins + '').padStart(2, '0')
    gElMediumSecs.innerText = (secs + '').padStart(2, '0')
  }

  // Render extreme best score
  var extremeBestScore = +localStorage.getItem('Extreme')
  if (extremeBestScore) {
    mins = extremeBestScore < 59 ? '00' : Math.floor(extremeBestScore / 60)
    secs = extremeBestScore < 59 ? extremeBestScore : extremeBestScore % 60
    gElExtremeMins.innerText = (mins + '').padStart(2, '0')
    gElExtremeSecs.innerText = (secs + '').padStart(2, '0')
  }
}

function showSafeCell() {
  if (gGame.safeClicks === 0 || !gGame.isOn) return
  console.log('in')
  gGame.safeClicks--
  var emptyCells = getEmptyCells(gBoard)
  var randomCell = getRandomFromArray(emptyCells)
  var location = emptyCells[randomCell]
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)

  var alpha = '1'
  var blinkingCellIntervalId = setInterval(function () {
    alpha = alpha === '1' ? '0.7' : '1'
    elCell.style.backgroundColor = `rgba(157, 216, 216,${alpha})`
  }, 300)

  setTimeout(function () {
    clearInterval(blinkingCellIntervalId)
    elCell.style.backgroundColor = 'lightgray'
  }, 2000)
  renderSafeClickCount()
}

function renderSafeClickCount() {
  var elSafeClickLable = document.querySelector('.safe-clicks-remain')
  elSafeClickLable.innerText = gGame.safeClicks
}

function undo() {
  if (!gPrevMoves.length || !gGame.isOn) return
  gBoard = gPrevMoves.pop()
  printMat(gBoard, '.container', 400 / gLevel.SIZE)
}

function cloneBoard() {
  var newBoard = []
  for (var i = 0; i < gBoard.length; i++) {
    var newRow = []
    for (var j = 0; j < gBoard.length; j++) {
      var newCell = { ...gBoard[i][j] }
      newRow.push(newCell)
    }
    newBoard.push(newRow)
  }
  return newBoard
}

function sevenBoom() {
  restartGame(true)
}

function turnOnManual() {
  var elManualToggle = document.querySelector('.manual-toggle')
  elManualToggle.classList.toggle('active')
  gGame.isManualOn = !gGame.isManualOn
}
