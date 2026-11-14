import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import {
  staggerTableBodyVariants,
  staggerTableRowVariants,
} from './MotionPrimitives';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  onResetEmpty?: () => void;
  resetLabel?: string;
  onRowClick?: (row: T) => void;
  selectedRowKey?: string;
  ariaLabel: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onResetEmpty,
  resetLabel,
  onRowClick,
  selectedRowKey,
  ariaLabel,
}: DataTableProps<T>) {
  const prefersReduced = useReducedMotion();
  const [sortCol, setSortCol] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc');

  const handleSort = (col: ColumnDef<T>) => {
    if (!col.sortable) return;
    if (sortCol === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col.key);
      setSortDir('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.key === sortCol);
    if (!col || !col.sortValue) return data;
    return [...data].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortCol, sortDir, columns]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading table rows"
        className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#0E131D]"
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-11 px-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={resetLabel}
        onAction={onResetEmpty}
      />
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-slate-200/90 dark:border-slate-800/90 rounded-lg bg-white dark:bg-[#0E131D]">
      <table
        aria-label={ariaLabel}
        className="w-full text-left border-collapse text-xs"
      >
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
            {columns.map((col) => {
              const isSorted = sortCol === col.key;
              const alignClass =
                col.align === 'right'
                  ? 'text-right justify-end'
                  : col.align === 'center'
                  ? 'text-center justify-center'
                  : 'text-left justify-start';

              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={`py-2.5 px-4 font-medium whitespace-nowrap ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className={`inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 rounded px-1 -mx-1 ${alignClass}`}
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <motion.tbody
          key={`${sortCol ?? 'none'}-${sortDir}-${sortedData
            .map((r) => rowKey(r))
            .join('|')}`}
          variants={prefersReduced ? undefined : staggerTableBodyVariants}
          initial={prefersReduced ? false : 'hidden'}
          animate="visible"
          className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono tabular-nums"
        >
          {sortedData.map((row) => {
            const key = rowKey(row);
            const isSelected = selectedRowKey === key;
            return (
              <motion.tr
                key={key}
                variants={prefersReduced ? undefined : staggerTableRowVariants}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={`h-11 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-cyan-50/70 dark:bg-cyan-950/25'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                } focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-2.5 px-4 whitespace-nowrap ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}
