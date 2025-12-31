const init = () => ({
  app: document.getElementById("app"),
  board: Array(6)
    .fill(null)
    .map((_) => Array(7).fill("")),
  current: "r",
});

let state = init();

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

      const element = elt(
        "div",
        { class: "field", id: `field-${rowIdx}-${colIdx}` },
        content,
      );

      element.addEventListener("click", () => dropDisc(colIdx));
      return element;
    }),
  );

  const board = elt("div", { class: "board" }, ...fields.flat());
  state.app.appendChild(board);

  const resetButton = elt("button", { id: "reset-button" }, "Reset Game");
  resetButton.addEventListener("click", () => {
    state = init();
    showBoard();
  });

  const saveButton = elt("button", { id: "save-button" }, "Save to Server");
  saveButton.addEventListener("click", () => saveGame());

  const loadButton = elt("button", { id: "load-button" }, "Load from Server");
  loadButton.addEventListener("click", () => loadGame());

  const buttonContainer = elt(
    "div",
    { class: "button-container" },
    resetButton,
    saveButton,
    loadButton,
  );
  state.app.appendChild(buttonContainer);
};

const saveGame = () => {
  fetch("/api/data/save?api-key=c4game", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: JSON.stringify(state) }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
      }

      return response.json();
    })
    .then((_) => {
      alert("Game saved successfully!");
    })
    .catch((error) => {
      alert(error);
    });
};

const loadGame = () => {
  fetch("/api/data/load")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Something went wrong: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      state = JSON.parse(data.content);
      state.app = document.getElementById("app");
      showBoard();
    });
};

const dropDisc = (colIdx) => {
  for (let rowIdx = state.board.length - 1; rowIdx >= 0; rowIdx--) {
    if (getField(rowIdx, colIdx) === "") {
      state.board[rowIdx][colIdx] = state.current;
      const winner = state.current;
      state.current = state.current === "r" ? "b" : "r";

      showBoard();

      if (connect4Winner(winner, state.board)) {
        setTimeout(() => {
          alert(`${winner === "r" ? "Red" : "Blue"} player wins!`);
          state = init();
          showBoard();
        }, 100);
      }
      return;
    }
  }
};
