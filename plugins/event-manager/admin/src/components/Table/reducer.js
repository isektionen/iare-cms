const updateAtIndex = (array, index, value) =>
  array.map((row, i) => {
    if (index === i) {
      row._isChecked = value;
    }

    return row;
  });

const updateRows = (array, shouldSelect) =>
  array.map((row) => {
    row._isChecked = shouldSelect;

    return row;
  });

export const reducer = (state, action) => {
  const { nextElement, sortBy, type, rows } = action;

  switch (type) {
    case "UPDATE_ROWS":
      return { ...state, rows };
    case "CHANGE_SORT":
      if (state.sortBy === sortBy && state.sortOrder === "asc") {
        return { ...state, sortOrder: "desc" };
      }
      if (state.sortBy !== sortBy) {
        return { ...state, sortOrder: "desc" };
      }
      if (state.sortBy === sortBy && state.sortOrder === "desc") {
        return { ...state, sortOrder: "asc", sortBy: nextElement };
      }
      return state;
    case "SELECT_ALL":
      return { ...state, rows: updateRows(state.rows, true) };
    case "SELECT_ROW":
      return {
        ...state,
        rows: updateAtIndex(state.rows, action.index, !action.row._isChecked),
      };
    case "UNSELECT_ALL":
      return { ...state, rows: updateRows(state.rows, false) };
    default:
      return state;
  }
};

export const initState = (state) => {
  const updatedRows = state.rows.map((row) => {
    return { ...row, _isChecked: false };
  });
  return { ...state, rows: updatedRows };
};
