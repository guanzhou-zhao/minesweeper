document.addEventListener('DOMContentLoaded', startGame)

function Cell(row, col, isMine, hidden) {
  this.row = row;
  this.col = col;
  this.isMine = isMine;
  this.hidden = hidden;
}

// Define your `board` object here!

var boardLength = 3;
var boardWidth = 3;
var mineAmount = 2;
var board = {
  cells: []
}

function startGame () {
  setupBoard(boardLength, boardWidth, mineAmount);

  document.getElementById('reset').addEventListener('click', startGame);
  document.addEventListener("click", checkForWin);
  document.addEventListener("contextmenu", checkForWin);
  // Don't remove this function call: it makes the game work!
  lib.initBoard()
}

// Generate Board
function setupBoard(boardLength, boardWidth, mineAmount) {
  // The Amount of mines added to board
  var mineAdded = 0
  // The percentage of mines of cells
  var mineRate = mineAmount / (boardLength * boardWidth);
  // Init board
  board.cells = [];
  // Add cells to board
  for (var i = 0; i < boardLength; i++) {
    for (var j = 0; j < boardWidth; j++) {
      if (mineAdded < mineAmount && Math.random() < mineRate) {
        board.cells.push(new Cell(i, j, true, true));
        mineAdded++;
      } else {
        board.cells.push(new Cell(i, j, false, true));
      }
    }
  }
  // If needed, add more mines
  while (mineAdded < mineAmount) {
    var filteredCells = board.cells.filter(function(cell) {
      return !cell.isMine;
    })
    for (let cell of filteredCells) {
      if (mineAdded < mineAmount && Math.random() > 1/2) {
        cell.isMine = true;
        mineAdded++;
      }
    }
  }

  //Set surroundingMines property to Cell
  for (let cell of board.cells) {
    cell.surroundingMines = countSurroundingMines(cell);
  }
}

// Define this function to look for a win condition:
//
// 1. Are all of the cells that are NOT mines visible?
// 2. Are all of the mines marked?
function checkForWin () {
  for (let cell of board.cells) {
    if (cell.isMine) {
      if (!cell.isMarked) {
        return;
      }
    } else {
      if(cell.hidden) {
        return;
      }
    }
  }
  // You can use this function call to declare a winner (once you've
  // detected that they've won, that is!)
    lib.displayMessage('You win!')
  // Play win audio
  document.getElementById("audio_win").play()
}

// Define this function to count the number of mines around the cell
// (there could be as many as 8). You don't have to get the surrounding
// cells yourself! Just use `lib.getSurroundingCells`:
//
//   var surrounding = lib.getSurroundingCells(cell.row, cell.col)
//
// It will return cell objects in an array. You should loop through
// them, counting the number of times `cell.isMine` is true.
function countSurroundingMines (cell) {
  var count = 0;
  /*
  for (let c of board.cells) {
    if (c.row >= cell.row - 1 && c.row <= cell.row + 1 && c.col >= cell.col - 1 && c.col <= cell.col + 1) {
      if (c.isMine) {
        count++;
      }
    }
  }
  if (count > 0 && cell.isMine) {
    count--;
  }
  */
  var surroundings = lib.getSurroundingCells(cell.row, cell.col);
  for (let c of surroundings) {
    if (c.isMine) {
      count++;
    }
  }
  return count;
}
