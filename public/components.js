const Field = ({ type, rowIdx, colIdx }) => {
  const field = ["div", { class: "field", id: `field-${rowIdx}-${colIdx}` }];
  if (type === "b") {
    field.push(["div", { class: "disc disc-blue" }]);
  } else if (type === "r") {
    field.push(["div", { class: "disc disc-red" }]);
  }

  return field;
};

const Board = ({ board }) => {
  const fields = board.map((row, rowIdx) =>
    row.map((col, colIdx) => {
      return [Field, { type: col, rowIdx: rowIdx, colIdx: colIdx }];
    }),
  ).flat();
  return ["div", { class: "board" }, ...fields];
};

const App = (state) => [Board, { board: state.board }];
