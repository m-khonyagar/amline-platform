import type { ReactNode } from 'react';

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: ReactNode[][];
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: 'right',
                  padding: '0.75rem',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{ padding: '0.8rem', borderBottom: '1px solid #f1f5f9' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
