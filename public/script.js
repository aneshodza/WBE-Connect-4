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

  const boardStructure = ["div", { class: "board" }];
  state.board.forEach((row, rowIdx) =>
    row.forEach((col, colIdx) => {
      const field = [
        "div",
        { class: "field", id: `field-${rowIdx}-${colIdx}` },
      ];
      if (col === "b") {
        field.push(["div", { class: "disc disc-blue" }]);
      } else if (col === "r") {
        field.push(["div", { class: "disc disc-red" }]);
      }

      boardStructure.push(field);
    }),
  );
  const boardElement = renderSJDON(boardStructure, state.app);
  state.board.forEach((row, rowIdx) => {
    row.forEach((_, colIdx) => {
      const el = boardElement.querySelector(`#field-${rowIdx}-${colIdx}`);
      el.addEventListener("click", () => dropDisc(colIdx));
    });
  });

  const containerEl = renderSJDON(["div", { id: "button-container" }, ""], state.app);
  const resetButtonEl = renderSJDON(
    ["button", { id: "reset-button" }, "Reset Game"],
    containerEl,
  );
  resetButtonEl.addEventListener("click", () => {
    state = init();
    showBoard();
  });

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
    })
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
