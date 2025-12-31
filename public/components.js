/**
 * The Field component represents a single field on the board.
 * @param {Object} props - The properties of the Field component:
 *   - type: The type of disc in the field ("", "r", "b").
 *   - rowIdx: The row index of the field.
 *   - colIdx: The column index of the field.
 * @returns {Array} SJDON representation of the Field component.
 */
const Field = ({ type, rowIdx, colIdx }) => {
  const field = ["div", { class: "field", id: `field-${rowIdx}-${colIdx}` }];
  if (type === "b") {
    field.push(["div", { class: "disc disc-blue" }]);
  } else if (type === "r") {
    field.push(["div", { class: "disc disc-red" }]);
  }

  return field;
};

/**
 * The Board component represents the entire game board.
 * @param {Object} props - The properties of the Board:
 *    - board: A 2D array representing the game board.
 * @returns {Array} SJDON representation of the Board component.
 */
const Board = ({ board }) => {
  const fields = board
    .map((row, rowIdx) =>
      row.map((col, colIdx) => {
        return [Field, { type: col, rowIdx: rowIdx, colIdx: colIdx }];
      }),
    )
    .flat();
  return ["div", { class: "board" }, ...fields];
};

/**
 * The App component is the root component of the application.
 * @param {Object} state - The current state of the application
 * @returns {Array} SJDON representation of the App component.
 */
const App = (state) => [Board, { board: state.board }];
