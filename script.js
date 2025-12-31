const state = {
  board: Array(6)
    .fill(null)
    .map((_) => Array(7).fill("")),
  app: document.getElementById("app"),
};

/**
 * Helper to get the value of a specific field on the board.
 * Exists so memorization of which access is row and which
 * is column is centralized.
 * @param {number} row - The row index of the field.
 * @param {number} col - The column index of the field.
 * @returns {string} The value at the specified field ("", "r", "b").
 */
const getField = (row, col) => {
  return state.board[row][col];
};

function elt(type, attrs, ...children) {
  let node = document.createElement(type);
  Object.keys(attrs).forEach((key) => {
    node.setAttribute(key, attrs[key]);
  });
  for (let child of children) {
    if (typeof child != "string") node.appendChild(child);
    else node.appendChild(document.createTextNode(child));
  }
  return node;
}

const showBoard = () => {
  state.app.innerHTML = "";
  const fields = state.board.map((row, rowIdx) =>
    row.map((col, colIdx) => {
      let content = "";
      if (col === "b") {
        content = elt("div", { class: "disc disc-blue" });
      } else if (col === "r") {
        content = elt("div", { class: "disc disc-red" });
      }

      return elt(
        "div",
        { class: "field", id: `field-${rowIdx}-${colIdx}` },
        content,
      );
    }),
  );

  const board = elt("div", { class: "board" }, ...fields.flat());
  state.app.appendChild(board);
};

const fillRandom = () => {
  const cols = state.board[0].length;
  const rows = state.board.length;

  const randomCol = Math.floor(Math.random() * cols);
  const randomRow = Math.floor(Math.random() * rows);

  const colors = ["r", "b", ""];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  state.board[randomRow][randomCol] = randomColor;
};

setInterval(() => {
  fillRandom();
  showBoard();
}, 1000);
