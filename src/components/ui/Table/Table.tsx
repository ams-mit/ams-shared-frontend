import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyText?: string;
  isLoading?: boolean;
  striped?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No records found',
  isLoading = false,
  striped = false,
}: TableProps<T>): React.ReactElement {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--color-primary-subtle)',
              borderBottom: '2px solid var(--color-border)',
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '0.875rem 1.25rem',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  fontSize: '0.8125rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  width: col.width,
                  textAlign: col.align || 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid var(--color-accent)',
                      borderRightColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '3rem 1rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                style={{
                  borderBottom: '1px solid var(--color-border-subtle)',
                  backgroundColor:
                    striped && index % 2 === 1 ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-sunken)')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    striped && index % 2 === 1 ? 'var(--color-surface-hover)' : 'var(--color-surface)')
                }
              >
                {columns.map((col) => {
                  const content = col.render
                    ? col.render(item, index)
                    : (item as Record<string, unknown>)[col.key] as React.ReactNode;
                  return (
                    <td
                      key={col.key}
                      style={{
                        padding: '1rem 1.25rem',
                        color: 'var(--color-text)',
                        verticalAlign: 'middle',
                        textAlign: col.align || 'left',
                      }}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
