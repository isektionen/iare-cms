import { Icon, Table as BuffetTable, Text } from "@buffetjs/core";
import { Checkbox, Links as StyledLinks } from "@buffetjs/styles";
import { faPencilAlt, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isFunction, isObject, sortBy as sort } from "lodash";
import React, { memo, useEffect, useReducer } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { initState, reducer } from "./reducer";

const StateWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 1rem;
  border-radius: 0.2rem;
  height: 2.5rem;
  ${({ theme, isGreen }) =>
    isGreen
      ? `
        border: 1px solid #aad67c;
        background-color: #e6f8d4;
        ${Text} {
            color: ${theme.main.colors.green};
        }
    `
      : `
        border: 1px solid #A5D5FF;
        background-color: ${theme.main.colors.lightestBlue};
        ${Text} {
            color: ${theme.main.colors.mediumBlue};
        }
    `};
`;

const customRow = ({ onClick, withBulkAction, rowLinks }) => {
  return ({ headers, onSelect, row }) => {
    return (
      <tr
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick(e, row);
        }}
      >
        {withBulkAction && (
          <td>
            <Checkbox
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={onSelect}
              checked={row._isChecked}
            />
          </td>
        )}
        {headers.map(({ value: cellName, cellFormatter, cellAdapter }) => {
          if (cellName === "state") {
            return (
              <td key={cellName} className={`${cellName}-cell`}>
                <StateWrapper isGreen={row[cellName]}>
                  <Text lineHeight="19px">
                    {row[cellName] ? "Published" : "Draft"}
                  </Text>
                </StateWrapper>
              </td>
            );
          }
          let displayedValue = !isObject(row[cellName]) ? row[cellName] : "-";

          if (isFunction(cellFormatter)) {
            displayedValue = cellFormatter(row[cellName], row);
          }

          let displayedContent = <p>{displayedValue || "-"}</p>;

          if (isFunction(cellAdapter)) {
            displayedContent = cellAdapter(row);
          }

          return (
            <td key={cellName} className={`${cellName}-cell`}>
              {displayedContent}
            </td>
          );
        })}
        {/* TODO rowLinks.length > 0 && (
          <td>
            <div style={{ width: "fit-content", float: "right" }}>
              <StyledLinks>
                {rowLinks.map((icon, index) => (
                  <button
                    // eslint-disable-next-line react/no-array-index-key
                    key={index + icon}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      icon.onClick(row);
                    }}
                    type="button"
                  >
                    <Icon className="link-icon" icon={icon.icon} />
                  </button>
                ))}
              </StyledLinks>
            </div>
          </td>
                  )*/}
      </tr>
    );
  };
};

const Table = ({ headers, rows, onClickRow, onConfirm }) => {
  const { pathname, search } = useLocation();
  const [tableState, dispatch] = useReducer(
    reducer,
    {
      headers,
      rows,
      sortBy: "id",
      sortOrder: "asc",
    },
    initState
  );
  const areAllEntriesSelected = tableState.rows.every(
    (row) => row._isChecked === true
  );

  const sortedRowsBy = sort(tableState.rows, [tableState.sortBy]);

  const sortedRows =
    tableState.sortOrder === "asc" ? sortedRowsBy : sortedRowsBy.reverse();

  const bulkActionProps = {
    icon: "trash",
    onConfirm,
  };

  const rowLinks = [
    {
      icon: <FontAwesomeIcon icon={faPencilAlt} />,
      onClick: (data) => {},
    },
    {
      icon: <FontAwesomeIcon icon={faTrashAlt} />,
      onClick: (data) => {},
    },
  ];

  useEffect(
    () =>
      dispatch({
        type: "UPDATE_ROWS",
        rows,
      }),
    [rows]
  );

  const CustomRow = customRow({
    onClick: onClickRow,
    withBulkAction: true,
    rowLinks: rowLinks,
  });
  return (
    <BuffetTable
      headers={tableState.headers}
      rows={sortedRows}
      customRow={CustomRow}
      showActionCollapse
      withBulkAction
      bulkActionProps={bulkActionProps}
      sortBy={tableState.sortBy}
      sortOrder={tableState.sortOrder}
      onClickRow={onClickRow}
      onChangeSort={({
        sortBy,
        firstElementThatCanBeSorted,
        isSortEnabled,
      }) => {
        if (isSortEnabled) {
          dispatch({
            type: "CHANGE_SORT",
            sortBy,
            nextElement: firstElementThatCanBeSorted,
          });
        }
      }}
      onSelect={(row, index) => {
        dispatch({
          type: "SELECT_ROW",
          row,
          index,
        });
      }}
      onSelectAll={() => {
        const type = areAllEntriesSelected ? "UNSELECT_ALL" : "SELECT_ALL";
        dispatch({ type });
      }}
      rowLinks={rowLinks}
    />
  );
};

export default memo(Table);
