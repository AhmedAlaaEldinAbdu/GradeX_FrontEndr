import React from "react";
import { useTranslation } from "react-i18next";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
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
        className="min-w-full border border-gray-300 text-sm text-right border-collapse"
        dir="rtl"
      >
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-4 py-4 border border-gray-300 text-center text-sm font-semibold ${column.headerClassName} text-gray-700`}
              >
                {t(column.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor(row, rowIndex)}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 py-2 border border-gray-300 text-sm text-gray-700 text-center ${
                    column.className || ""
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {typeof column.accessor === "function"
                      ? column.accessor(row)
                      : String(row[column.accessor])}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">لا توجد بيانات</div>
      )}
    </div>
  );
}

export default Table;
