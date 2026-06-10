import React from 'react';
import PropTypes from 'prop-types';

const Table = ({
  columns,
  data,
  caption,
  className = '',
  rowIdPattern,
  sortConfig,
  onSort,
  getSortIcon,
  appendRow,
}) => {
  return (
    <table className={className}>
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col) => {
            if (col.hidden) return null;

            const isSorted = sortConfig && sortConfig.key === col.key;
            const headerClass = [
              col.headerClassName || '',
              col.sortable ? 'sortable-header' : '',
              isSorted ? 'sorted-colm' : '',
              `col-${col.key}`,
            ].filter(Boolean).join(' ');

            return (
              <th
                key={col.key}
                className={headerClass}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                style={col.headerStyle}
              >
                {col.label}
                {col.sortable && getSortIcon && getSortIcon(col.key)}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => {
          const rowId = rowIdPattern ? rowIdPattern(row, rowIndex) : undefined;
          return (
            <tr key={row.id || rowIndex} id={rowId}>
              {columns.map((col) => {
                if (col.hidden) return null;

                const cellClass = [
                  col.className || '',
                  `col-${col.key}`,
                  sortConfig && sortConfig.key === col.key ? 'sorted-colm' : '',
                ].filter(Boolean).join(' ');

                return (
                  <td
                    key={`${row.id || rowIndex}-${col.key}`}
                    data-label={typeof col.label === 'string' ? col.label : col.key}
                    className={cellClass}
                    onClick={col.onCellClick ? (e) => col.onCellClick(row, e) : undefined}
                  >
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                  </td>
                );
              })}
            </tr>
          );
        })}
        {appendRow && appendRow(columns)}
      </tbody>
    </table>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      hidden: PropTypes.bool,
      sortable: PropTypes.bool,
      render: PropTypes.func,
      className: PropTypes.string,
      headerClassName: PropTypes.string,
      headerStyle: PropTypes.object,
      onCellClick: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  caption: PropTypes.node,
  className: PropTypes.string,
  rowIdPattern: PropTypes.func,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.string,
  }),
  onSort: PropTypes.func,
  getSortIcon: PropTypes.func,
  appendRow: PropTypes.func,
};

export default Table;