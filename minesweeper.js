document.addEventListener('DOMContentLoaded', startGame)

function Cell(row, col, isMine, hidden) {
  this.row = row;
  this.col = col;
  this.isMine = isMine;
  this.hidden = hidden;
}

// Define your `board` object here!
var board = {
  cells: [new Cell(0, 0, false, true), new Cell(0, 1, false, true), new Cell(0, 2, false, true), new Cell(1, 0, false, true), new Cell(1, 1, false, true), new Cell(1, 2, true, true), new Cell(2, 0, true, true), new Cell(2, 1, true, true), new Cell(2, 2, true, true)]
}

function startGame () {
  for (let cell of board.cells) {
    cell.surroundingMines = countSurroundingMines(cell);
  }
  document.addEventListener("click", checkForWin);
  document.addEventListener("contextmenu", checkForWin);
  // Don't remove this function call: it makes the game work!
  lib.initBoard()
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
