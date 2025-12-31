/**
 * Initializes the game state.
 * @returns {Object} The initial game state.
 */
const init = () => ({
  app: document.getElementById("app"),
  board: Array(6)
    .fill(null)
    .map((_) => Array(7).fill("")),
  current: "r",
  moves: [],
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

/**
 * Builds the JSDON DOM, attaches to the app root, and sets up event listeners.
 * Also sets up save/load buttons depending on server reachability.
 */
const showBoard = () => {
  state.app.innerHTML = "";

  const boardEl = renderSJDON([App, state], state.app);
  const fieldEls = [...boardEl.getElementsByClassName("field")];
  fieldEls.forEach((fieldEl) => {
    fieldEl.addEventListener("click", () => {
      const [_rowIdx, colIdx] = fieldEl.id.split("-").slice(1);
      dropDisc(parseInt(colIdx));
    });
  });

  const containerEl = renderSJDON(
    ["div", { id: "button-container" }, ""],
    state.app,
  );
  const resetButtonEl = renderSJDON(
    ["button", { id: "reset-button" }, "Reset Game"],
    containerEl,
  );
  resetButtonEl.addEventListener("click", () => {
    state = init();
    showBoard();
  });

  const undoButtonEl = renderSJDON(
    ["button", { id: "undo-button" }, "Undo Move"],
    containerEl,
  );
  undoButtonEl.addEventListener("click", () => undo());

  isServerReachable()
    .then(() => {
      const saveBtn = renderSJDON(
        ["button", { id: "save-button" }, "Save to Server"],
        containerEl,
      );
      saveBtn.addEventListener("click", () => saveGame());

      const loadBtn = renderSJDON(
        ["button", { id: "load-button" }, "Load from Server"],
        containerEl,
      );
      loadBtn.addEventListener("click", () => loadGame());
    })
    .catch(() => {
      const saveBtn = renderSJDON(
        ["button", { id: "save-button" }, "Save to LocalStorage"],
        containerEl,
      );
      saveBtn.addEventListener("click", () => {
        localStorage.setItem("c4game", JSON.stringify(state));
        alert("Saved locally!");
      });

      const loadBtn = renderSJDON(
        ["button", { id: "load-button" }, "Load from LocalStorage"],
        containerEl,
      );
      loadBtn.addEventListener("click", () => {
        const saved = localStorage.getItem("c4game");
        if (saved) {
          state = JSON.parse(saved);
          state.app = document.getElementById("app");
          showBoard();
        }
      });
    });
};

/**
 * Saves the current game state to the server.
 */
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

/**
 * Loads the game state from the server.
 */
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

/**
 * Attempts to drop a disc into the specified column. Triggers a re-render
 * and win check if successful.
 * @param {number} colIdx - The index of the column to drop the disc into.
 */
const dropDisc = (colIdx) => {
  for (let rowIdx = state.board.length - 1; rowIdx >= 0; rowIdx--) {
    if (getField(rowIdx, colIdx) === "") {
      state.board[rowIdx][colIdx] = state.current;
      const winner = state.current;
      state.current = state.current === "r" ? "b" : "r";
      state.moves.push({ row: rowIdx, col: colIdx });

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

/**
 * Checks if the server is reachable by sending a HEAD request to /api/ping.
 * @returns {Promise<boolean>} Resolves to true if the server is reachable, otherwise throws an error.
 */
async function isServerReachable() {
  try {
    const response = await fetch("/api/ping", {
      method: "HEAD",
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Server error");
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Undoes the last move made by a player.
 */
const undo = () => {
  if (state.moves.length === 0) {
    alert("No moves to undo!");
    return;
  }
  const lastMove = state.moves.pop();
  state.board[lastMove.row][lastMove.col] = "";
  state.current = state.current === "r" ? "b" : "r";
  showBoard();
};
