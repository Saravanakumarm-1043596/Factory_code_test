import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium text-slate-900">{start}</span>–
        <span className="font-medium text-slate-900">{end}</span> of{' '}
        <span className="font-medium text-slate-900">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="px-2 text-sm text-slate-600">
          Page {page} of {Math.max(pageCount, 1)}
        </span>
        <button
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="inline-flex items-center rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
