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
  renderSafeClickCount()
  gGame.minesNotRevealed = gLevel.MINES

  if (gGame.isSevenBoom) {
    addMines()
    gGame.isOn = true
  }
}

function changeDifficulty(SIZE, MINES) {
  gLevel = {
    SIZE,
    MINES,
    minesAdded: [],
  }

  restartGame()
}

function startGame(clickedRow, clickedCol) {
  gGame.isOn = true
  gGame.isFirstMove = false
  addMines(clickedRow, clickedCol)
  startTimer()
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
  } else showAllMines(gLevel.minesAdded)
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
  gPrevMoves = []

  init()

  //Reset and render timer
  clearInterval(gGameTimerIdx)
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
  if (!gGame.isOn) return
  gGame.isHintOn = true
}

function showHint(ellClickedCell, row, col) {
  ellClickedCell.innerText = gBoard[row][col].minesAroundCount
  var neighbors = getNeighbors(gBoard, row, col)
  for (var i = 0; i < neighbors.length; i++) {
    if (neighbors[i].cell.isShown) continue
    var currCellContent = neighbors[i].cell.isMine
      ? MINE
      : neighbors[i].cell.minesAroundCount
    renderCell(neighbors[i].location, currCellContent)
  }

  setTimeout(function () {
    ellClickedCell.innerText = ''
    for (var i = 0; i < neighbors.length; i++) {
      if (neighbors[i].cell.isShown) continue
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

function renderSafeClickCount() {
  var elSafeClickLable = document.querySelector('.safe-clicks-remain')
  elSafeClickLable.innerText = gGame.safeClicks
}

function undo() {
  if (!gPrevMoves.length || !gGame.isOn) return

  var lastGameState = gPrevMoves.pop()
  gBoard = [...lastGameState.newBoard]
  gGame = lastGameState.newGame
  printMat(gBoard, '.container', 450 / gLevel.SIZE)
  renderLives()
  renderHints()
  renderSafeClickCount()
}

function cloneBoard() {
  var gameState = {
    newBoard: [],
    newGame: { ...gGame },
  }
  for (var i = 0; i < gBoard.length; i++) {
    var newRow = []
    for (var j = 0; j < gBoard.length; j++) {
      var newCell = { ...gBoard[i][j] }
      newRow.push(newCell)
    }
    gameState.newBoard.push(newRow)
  }
  return gameState
}

function sevenBoom() {
  if (gGame.isManualOn) return
  restartGame(true)
}

function turnOnManual() {
  var elManualToggle = document.querySelector('.manual-toggle')
  elManualToggle.classList.toggle('active')
  gGame.isManualOn = !gGame.isManualOn
}
