var lib = {
  initBoard: initBoard,
  displayMessage: displayMessage,
  getSurroundingCells: getSurroundingCells
}

function initBoard () {
  if (!tests.boardValid() || !tests.cellsValid()) {
    return null
  }
  displayMessage("Let\'s play!")
  board.cells.sort(cellCompare)
  var boardNode = document.getElementsByClassName('board')[0]
  // Empty board before drawing
  boardNode.innerHTML = ''
  drawBoard(boardNode)
  addListeners(boardNode)
  return true
}

// Draw board based on number of cells and an assumption about how much
// space should be allowed for each cell.
function drawBoard (boardNode) {
  boardNode.style.width = Math.sqrt(board.cells.length) * 85 + 'px'
  board.cells.reduce(cellsToNodes, boardNode)
}

function cellCompare (a, b) {
  if (a.row < b.row) {
    return -1
  } else if (a.row > b.row) {
    return 1
  }
  if (a.col < b.col) {
    return -1
  } else if (a.col > b.col) {
    return 1
  }
  return 0
}

function cellsToNodes (boardNode, cell) {
  var node = document.createElement('div')
  node.classList.add('row-' + cell.row)
  node.classList.add('col-' + cell.col)
  if (cell.isMine) {
    node.classList.add('mine')
  }

  // add class mark if node has surroundingMines
  if (cell.surroundingMines) {
    node.classList.add('surrounded')
  }
  if (cell.hidden) {
    node.classList.add('hidden')
  } else {
    if (cell.surroundingMines && !cell.isMine) {
      node.innerHTML = cell.surroundingMines
    }
  }
  boardNode.appendChild(node)
  return boardNode
}

function addListeners (boardNode) {
  for (var i = 0; i < boardNode.children.length; i++) {
    boardNode.children[i].addEventListener('click', showCell)
    boardNode.children[i].addEventListener('contextmenu', markCell)

    // Add event listener to cell that is not hidden and not a mine and has surroundingMines
    var cellElemt = boardNode.children[i]
    if (cellElemt.classList.contains("surrounded")) {
      cellElemt.addEventListener('mousedown', toggleHint)
      cellElemt.addEventListener('mouseup', toggleHint)
    }
  }
}
function toggleHint(evt) {
  var idx = getCellIndex(getRow(evt.target), getCol(evt.target))
  var cell = board.cells[idx]
  var surroundingCells = getSurroundingCells(cell.row, cell.col)

  var markedCells = surroundingCells.filter(function(c) {
    return c.isMarked
  })
  // Auto reveal hidden cells if all the surroundingMines are markedCells
  // otherwise, show hint
  if (markedCells.length == cell.surroundingMines) {
    var unmarkedHiddenCells = surroundingCells.filter(function(c) {
      return c.hidden && !c.isMarked
    })
    unmarkedHiddenCells.forEach(setInnerHTML)
  } else {
    surroundingCells.forEach(function(c) {
      // Don't display hint on marked cell
      if (c.hidden && !c.isMarked) {
        getNodeByCoordinates(c.row, c.col).classList.toggle('hint')
      }
    })
  }

}
function startCountingTime() {
    // Start time counting if needed
    if (!startTime) {
      startTime = new Date().getTime()
    }
}

function showCell (evt) {
  startCountingTime()
  var idx = getCellIndex(getRow(evt.target), getCol(evt.target))
  var cell = board.cells[idx]
  cell.hidden = false
  cell.isMarked = false
  evt.target.classList.remove('hidden')
  evt.target.classList.remove('marked')
  if (evt.target.classList.contains('mine')) {
    // Show that this cell is wrongly marked
    evt.target.classList.add('wrong')
    board.cells.filter(function(c) {return c.isMine && c.hidden && !c.isMarked}).forEach(function(c) {
      getNodeByCoordinates(c.row, c.col).classList.add("left")
    })
    // Play bomb audio
    document.getElementById("audio_bomb").play()
    displayMessage('BOOM!')
    revealMines()
    //board.cells.filter(function(c) {return c.hidden && !c.isMine}).forEach(setInnerHTML)
    removeListeners()
    endTime = new Date().getTime()
    return
  }
  setInnerHTML(cell)
  if (cell.surroundingMines === 0) {
    showSurrounding(evt.target)
  }
  // Remove reveal audio
  checkForWin()
}

function markCell (evt) {
  startCountingTime()
  evt.preventDefault()
  evt.target.classList.toggle('marked')
  var idx = getCellIndex(getRow(evt.target), getCol(evt.target))
  var cell = board.cells[idx]

  cell.isMarked = cell.isMarked ? false : true
  // Reset mines left element
  setMinesLeft()

  if (!checkForWin()) {
    // Play mark or unmark audio
    cell.isMarked ? document.getElementById("audio_mark").play() : document.getElementById("audio_unmark").play()
  }
}

// Array.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict'
    var O = Object(this)
    var len = parseInt(O.length, 10) || 0
    if (len === 0) {
      return false
    }
    var n = parseInt(arguments[1], 10) || 0
    var k
    if (n >= 0) {
      k = n
    } else {
      k = len + n
      if (k < 0) {k = 0}
    }
    var currentElement
    while (k < len) {
      currentElement = O[k]
      if (searchElement === currentElement) { // NaN !== NaN
        return true
      }
      k++
    }
    return false
  }
}

// Returns a subset of the `cells` array, including only those cells
// which are adjacent to `row`, `col`
function getSurroundingCells (row, col) {
  var columns = getRange(getLowerBound(col), getUpperBound(col))
  var rows = getRange(getLowerBound(row), getUpperBound(row))
  return board.cells
    .filter(function (cell) {
      return columns.includes(cell.col) && rows.includes(cell.row)
    })
}

// For the given DOM element, displays surrounding mine counts
// under the following conditions:
//  - cell is not a mine
//  - cell has not already been checked
function showSurrounding (element) {
  getSurroundingCells(getRow(element), getCol(element))
    .filter(function (cell) {
      return !cell.isMine && !cell.isMarked
    })
    .filter(function (cell) {
      // Avoid breaking the call stack with recurrent checks on same cell
      return !cell.isProcessed
    })
    .forEach(setInnerHTML)
}

// For the given cell object, set innerHTML to cell.surroundingMines
// under the following conditions:
//  - cell has not been marked by the user
//  - surroundingMines is > 0
// If surroundingMines is 0, greedily attempt to expose as many more cells
// as possible.
function setInnerHTML (cell) {
  cell.isProcessed = true
  var element = getNodeByCoordinates(cell.row, cell.col)
  if (element.innerHTML !== '') {
    return
  }
  element.innerHTML = cell.surroundingMines > 0 ?
    cell.surroundingMines : ''
  if (element.classList.contains('hidden')) {
    cell.hidden = false
    element.classList.remove('hidden')
    if (cell.surroundingMines === 0) {
      return showSurrounding(element)
    }
  }
}

function getRange(begin, end) {
  return Array.apply(begin, Array(end - begin + 1))
    .map(function (n, i) {
      return begin + i
    })
}

function getLowerBound (n) {
  return n - 1 < 0 ? 0 : n -1
}

function getUpperBound (n) {
  var limit = Math.sqrt(board.cells.length)
  return n + 1 > limit ? limit : n + 1
}

function displayMessage (msg) {
  document.getElementById('message').innerHTML = '<p>' + msg + '</p>'
}

function getRow (element) {
  return parseInt(getCoordinate(element, 'row'), 10)
}

function getCol (element) {
  return parseInt(getCoordinate(element, 'col'), 10)
}

function getCoordinate (element, coordinate) {
  return makeArray(element.classList)
    .find(function (cssClass) {
      return cssClass.substring(0, coordinate.length) === coordinate
    })
    .split('-')[1]
}

function revealMines () {
  makeArray(document.getElementsByClassName('mine'))
    .forEach(function (element) {
      element.classList.remove('hidden')
      element.classList.remove('marked')
    })
}

// Cloning removes event listeners
function removeListeners () {
  var board = document.getElementsByClassName('board')[0]
  var clone = board.cloneNode(true)
  board.parentNode.replaceChild(clone, board)
}

// Convert classLists and HTMLCollections
function makeArray (list) {
  return [].slice.call(list)
}

function getCellIndex (row, col) {
  var idx = null
  board.cells.find(function (cell, i) {
    if (cell.row === row && cell.col === col) {
      idx = i
      return true
    }
  })
  return idx
}

function getNodeByCoordinates (row, col) {
  var rowClass = 'row-' + row
  var colClass = 'col-' + col
  return document.getElementsByClassName(rowClass + ' ' + colClass)[0]
}
