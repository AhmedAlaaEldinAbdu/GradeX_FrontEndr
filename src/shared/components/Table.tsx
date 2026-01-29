import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

interface Column<T> {
  header: string;
  headerComponent?: React.ReactNode;
  accessor: keyof T | ((row: T, index?: number) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  sticky?: boolean | 'left' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  floatingActions?: boolean; // Enable floating actions overlay
}

function Table<T>({ columns, data, keyExtractor, floatingActions = false }: TableProps<T>) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLanguage();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [showFloatingActions, setShowFloatingActions] = useState(floatingActions);
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Find the last column (actions column)
  const lastColumn = columns[columns.length - 1];
  const hasActionsColumn =
    lastColumn &&
    (lastColumn.sticky === 'right' ||
      lastColumn.header.toLowerCase().includes('action') ||
      lastColumn.header.includes('إجراء'));

  // Measure row heights for the floating overlay
  useEffect(() => {
    if (!floatingActions || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll('tbody tr');
    const heights = Array.from(rows).map((row) => row.getBoundingClientRect().height);
    setRowHeights(heights);

    const header = tableRef.current.querySelector('thead tr');
    if (header) {
      setHeaderHeight(header.getBoundingClientRect().height);
    }
  }, [data, floatingActions]);

  // Handle scroll to show/hide floating actions
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !floatingActions) return;

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    // Calculate how much more can be scrolled
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      // No scroll needed, hide floating actions (all content visible)
      setShowFloatingActions(false);
      return;
    }

    // RTL scroll behavior varies by browser:
    // - Chrome/Edge: scrollLeft starts at 0, becomes negative as you scroll left
    // - Firefox: scrollLeft starts at 0, stays positive but decreases
    // - Safari: scrollLeft starts at maxScroll, decreases to 0

    // For RTL: The "end" is when user scrolls to see the LEFT side of the table
    // (where the actions column actually sits physically)
    // For LTR: The "end" is when user scrolls to see the RIGHT side

    let scrolledToEnd: boolean;

    if (isRTL) {
      // In RTL, when scrollLeft is near 0 (or negative in some browsers),
      // the user is at the START (right side). When they scroll to see
      // the left side (actions), scrollLeft becomes more negative.
      // The actions column is at the LEFT in RTL, which is the "far" position.
      // Check if user has scrolled enough to the left
      const scrolledAmount = Math.abs(scrollLeft);
      scrolledToEnd = scrolledAmount >= maxScroll - 5;
    } else {
      // LTR: scrollLeft increases as you scroll right
      scrolledToEnd = scrollLeft >= maxScroll - 5;
    }

    // Show floating actions when NOT scrolled to the end
    setShowFloatingActions(!scrolledToEnd);
  }, [floatingActions, isRTL]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !floatingActions) return;

    // Initial check
    handleScroll();

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll, floatingActions]);

  // Render floating actions overlay
  const renderFloatingActions = () => {
    if (!floatingActions || !showFloatingActions || !hasActionsColumn || data.length === 0) {
      return null;
    }

    return (
      <div
        className={`floating-actions-overlay ${isRTL ? 'floating-actions-left' : 'floating-actions-right'}`}
        style={{ top: 0 }}
      >
        {/* Floating Header */}
        <div className="floating-actions-header" style={{ height: headerHeight || 'auto' }}>
          {lastColumn.headerComponent ? lastColumn.headerComponent : t(lastColumn.header)}
        </div>

        {/* Floating Rows */}
        {data.map((row, rowIndex) => (
          <div
            key={keyExtractor(row, rowIndex)}
            className="floating-actions-cell"
            style={{ height: rowHeights[rowIndex] || 'auto' }}
          >
            {typeof lastColumn.accessor === 'function'
              ? lastColumn.accessor(row, rowIndex)
              : String(row[lastColumn.accessor as keyof T])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      <div ref={scrollContainerRef} className="w-full overflow-x-auto">
        <table
          ref={tableRef}
          className={`mb-1 min-w-full border-collapse border border-gray-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
          dir={direction}
        >
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              {columns.map((column, index) => {
                const isStickyLeft = column.sticky === 'left' || column.sticky === true;
                const isStickyRight = column.sticky === 'right';

                let stickyClass = '';
                let stickyStyle: React.CSSProperties = {};

                if (isStickyLeft) {
                  stickyClass = 'sticky-header';
                  stickyStyle = { left: calculateStickyPosition(columns, index, 'left') };
                } else if (isStickyRight && !floatingActions) {
                  // Only apply sticky styles if floating actions is disabled
                  if (isRTL) {
                    stickyClass = 'sticky-header';
                    stickyStyle = { left: calculateStickyPosition(columns, index, 'right') };
                  } else {
                    stickyClass = 'sticky-header-right';
                    stickyStyle = { right: calculateStickyPosition(columns, index, 'right') };
                  }
                }

                return (
                  <th
                    key={index}
                    className={`border border-gray-300 bg-gray-100 px-4 py-4 text-center text-base font-normal ${column.headerClassName || ''} text-black-900 ${stickyClass}`}
                    style={stickyStyle}
                  >
                    {column.headerComponent ? column.headerComponent : t(column.header)}
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
                  const isStickyLeft = column.sticky === 'left' || column.sticky === true;
                  const isStickyRight = column.sticky === 'right';

                  let stickyClass = '';
                  let stickyStyle: React.CSSProperties = {};

                  if (isStickyLeft) {
                    stickyClass = 'sticky-cell';
                    stickyStyle = { left: calculateStickyPosition(columns, colIndex, 'left') };
                  } else if (isStickyRight && !floatingActions) {
                    if (isRTL) {
                      stickyClass = 'sticky-cell';
                      stickyStyle = { left: calculateStickyPosition(columns, colIndex, 'right') };
                    } else {
                      stickyClass = 'sticky-cell-right';
                      stickyStyle = { right: calculateStickyPosition(columns, colIndex, 'right') };
                    }
                  }

                  return (
                    <td
                      key={colIndex}
                      className={`border border-gray-300 px-4 py-2 text-center text-base font-normal text-gray-500 ${
                        column.className || ''
                      } ${stickyClass}`}
                      style={stickyStyle}
                    >
                      <div className="flex items-center justify-center text-base font-normal text-gray-500">
                        {typeof column.accessor === 'function'
                          ? column.accessor(row, rowIndex)
                          : String(row[column.accessor])}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="py-8 text-center text-gray-500">{t('common.noData')}</div>
        )}
      </div>

      {/* Floating Actions Overlay */}
      {renderFloatingActions()}
    </div>
  );
}

function calculateStickyPosition<T>(
  columns: Column<T>[],
  currentIndex: number,
  type: 'left' | 'right' = 'left'
): number {
  let position = 0;
  const totalColumns = columns.length;

  if (type === 'right') {
    for (let i = totalColumns - 1; i > currentIndex; i--) {
      if (columns[i].sticky === 'right' || (columns[i].sticky === true && type === 'right')) {
        position += 100;
      }
    }
    return position;
  }

  // Left sticky logic
  for (let i = 0; i < currentIndex; i++) {
    if (columns[i].sticky === 'left' || columns[i].sticky === true) {
      position += 100;
    }
  }
  return position;
}

export default Table;
