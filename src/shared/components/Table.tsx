import React from 'react';
import { useTranslation } from 'react-i18next';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  sticky?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
}

function Table<T>({ columns, data, keyExtractor }: TableProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="min-w-full border-collapse border border-gray-300 text-right text-sm"
        dir="rtl"
      >
        <thead>
          <tr className="border-b border-gray-200 bg-gray-100">
            {columns.map((column, index) => {
              const stickyClass = column.sticky ? 'sticky-header' : '';
              const stickyStyle = column.sticky
                ? { left: calculateStickyPosition(columns, index) }
                : {};

              return (
                <th
                  key={index}
                  className={`border border-gray-300 bg-gray-100 px-4 py-4 text-center text-sm font-semibold ${column.headerClassName} text-gray-700 ${stickyClass}`}
                  style={stickyStyle}
                >
                  {t(column.header)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className="border-b border-gray-200 transition-colors hover:bg-gray-50"
            >
              {columns.map((column, colIndex) => {
                const stickyClass = column.sticky ? 'sticky-cell' : '';
                const stickyStyle = column.sticky
                  ? { left: calculateStickyPosition(columns, colIndex) }
                  : {};

                return (
                  <td
                    key={colIndex}
                    className={`border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 ${
                      column.className || ''
                    } ${stickyClass}`}
                    style={stickyStyle}
                  >
                    <div className="flex items-center justify-center">
                      {typeof column.accessor === 'function'
                        ? column.accessor(row)
                        : String(row[column.accessor])}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="py-8 text-center text-gray-500">لا توجد بيانات</div>}
    </div>
  );
}

function calculateStickyPosition<T>(columns: Column<T>[], currentIndex: number): number {
  let position = 0;
  const totalColumns = columns.length;
  for (let i = totalColumns - 1; i > currentIndex; i--) {
    if (columns[i].sticky) {
      position += 100;
    }
  }
  return position;
}

export default Table;
