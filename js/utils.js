'use strict'

function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      row.push(cell)
    }
    mat.push(row)
  }
  return mat
}

function printMat(mat, selector, cellSize) {
  var strHTML = '<table border="0"><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      var cell = ''
      if (mat[i][j].isShown) cell = mat[i][j].minesAroundCount
      if (mat[i][j].isMine && mat[i][j].isShown) cell = MINE
      if (mat[i][j].isMarked) cell = FLAG
      var className = 'cell cell-' + i + '-' + j
      strHTML += `<td style="width:${cellSize}px; height:${cellSize}px; font-size:${
        cellSize * 0.3
      }px" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(event, this, ${i}, ${j})" class="${className}"> ${cell} </td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'
  var elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomColor() {
  var red = getRandomInt(0, 255)
  var green = getRandomInt(0, 255)
  var blue = getRandomInt(0, 255)
  return `rgb(${red},${green},${blue})`
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor((max - min + 1) * Math.random() + min)
}

function getEmptyCells(mat, empty) {
  var emptyCells = []
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat.length; j++) {
      if (!mat[i][j].isMine && !mat[i][j].isShown) emptyCells.push({ i, j })
    }
  }

  return emptyCells
}

function getEmptyCellsExcept(mat, row, col) {
  var emptyCells = []
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat.length; j++) {
      if (i === row && j === col) continue
      if (!mat[i][j].isMine) emptyCells.push({ i, j })
    }
  }

  return emptyCells
}

function getRandomFromArray(arr) {
  return getRandomInt(0, arr.length - 1)
}

function getEmptyFromMat(mat) {
  var emptyCells = []
  for (var i = 0; i < mat.length; i++) {
    for (var j = 0; j < mat.length; j++) {
      if (!mat[i][j].isMine) {
        emptyCells.push({
          location: { i, j },
          cell: mat[i][j],
        })
      }
    }
  }
  return emptyCells
}

function getNeighbors(mat, row, col) {
  var neighbors = []
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j > mat.length - 1) continue
      var neighbor = {
        cell: mat[i][j],
        location: { i, j },
      }
      neighbors.push(neighbor)
    }
  }
  // console.log(`location: ${row},${col}`, neighbors)

  return neighbors
}

function openModal(selector, msg) {
  var elModal = document.querySelector(selector)
  elModal.querySelector('.msg').innerText = msg
  elModal.style.display = 'block'
  setTimeout(function () {
    elModal.style.opacity = '1'
  }, 0)
}

function closeModal(selector) {
  var elModal = document.querySelector(selector)
  elModal.style.display = 'none'
}
