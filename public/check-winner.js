function connect4Winner(p, board) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const rowDownSpace = row + 3 < board.length;
      const rowUpSpace = row - 3 >= 0;
      const colRightSpace = col + 3 < board[row].length;
      const colLeftSpace = col - 3 >= 0;
      if (rowDownSpace) {
        if (
          p === board[row][col] &&
          p === board[row + 1][col] &&
          p === board[row + 2][col] &&
          p === board[row + 3][col]
        ) {
          return true;
        }
      }

      if (colRightSpace) {
        if (
          p === board[row][col] &&
          p === board[row][col + 1] &&
          p === board[row][col + 2] &&
          p === board[row][col + 3]
        ) {
          return true;
        }
      }

      if (rowDownSpace && colRightSpace) {
        if (
          p === board[row][col] &&
          p === board[row + 1][col + 1] &&
          p === board[row + 2][col + 2] &&
          p === board[row + 3][col + 3]
        ) {
          return true;
        }
      }

      if (rowUpSpace && colRightSpace) {
        if (
          p === board[row][col] &&
          p === board[row - 1][col + 1] &&
          p === board[row - 2][col + 2] &&
          p === board[row - 3][col + 3]
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

