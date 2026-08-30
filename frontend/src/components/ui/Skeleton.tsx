interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
          {Array.from({ length: columns }).map((__, c) => (
            <div key={c} className="h-3.5 flex-1 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}
