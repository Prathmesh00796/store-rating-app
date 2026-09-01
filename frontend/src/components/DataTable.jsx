/**
 * DataTable — reusable sortable table component.
 * 
 * Props:
 *   columns  — array of { key, label, sortable? }
 *   data     — array of row objects
 *   sortBy   — current sort field
 *   order    — 'asc' or 'desc'
 *   onSort   — callback(key) when a column header is clicked
 *   onRowClick — optional callback(row) when a row is clicked
 *   renderCell — optional function(row, column) to customize cell rendering
 */
export default function DataTable({ columns, data, sortBy, order, onSort, onRowClick, renderCell }) {
  // Determine sort icon for a column
  function getSortIcon(key) {
    if (sortBy !== key) return ' ↕';
    return order === 'asc' ? ' ↑' : ' ↓';
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && onSort && onSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
              >
                {col.label}
                {col.sortable !== false && (
                  <span className={`sort-icon ${sortBy === col.key ? 'active' : ''}`}>
                    {getSortIcon(col.key)}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
