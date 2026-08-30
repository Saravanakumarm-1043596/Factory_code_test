import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, Boxes as BoxesIcon, Building2 as Building2Icon, ClipboardList as ClipboardListIcon, Database as DatabaseIcon, FileText as FileTextIcon, Layers as LayersIcon, Tag as TagIcon, Users as UsersIcon, ShieldCheck as ShieldCheckIcon } from 'lucide-react';
import clsx from 'clsx';

const APP_TITLE = "Lab Test Workbench";

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/lab-test-orders', label: "Lab Test Orders", icon: UsersIcon },
  { to: '/lab-test-lines', label: "Lab Test Results", icon: DatabaseIcon },
  { to: '/claims', label: "Claims", icon: LayersIcon },
  { to: '/claim-lines', label: "Claim Lines", icon: ClipboardListIcon },
  { to: '/claim-errors', label: "Claim Errors", icon: BoxesIcon },
  { to: '/members', label: "Members", icon: FileTextIcon },
  { to: '/providers', label: "Providers", icon: Building2Icon },
  { to: '/phi-access-logs', label: "PHI Access Log", icon: TagIcon },
  { to: '/compliance-controls', label: "Compliance Controls", icon: UsersIcon },
  { to: '/compliance-findings', label: "Compliance Findings", icon: DatabaseIcon },
  { to: '/line-of-businesses', label: "Lines of Business", icon: LayersIcon },
  { to: '/users', label: "Users", icon: ClipboardListIcon },
];

interface TopNavProps {
  projectName: string;
}

export function TopNav({ projectName }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 flex-none items-center gap-6 border-b border-slate-200 bg-white px-6 shadow-sm">
      <div className="flex w-56 flex-none items-center gap-2">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <ShieldCheckIcon className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold tracking-wide text-slate-900">Payer Portal</span>
          <span className="truncate text-[11px] font-medium text-slate-500" title={projectName}>
            {APP_TITLE}
          </span>
        </span>
      </div>
      <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-150',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <item.icon className="h-4 w-4 flex-none" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex w-56 flex-none items-center justify-end gap-3">
      {(import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase() !== 'live' && (
        <span
          title="Sample data. This preview is not connected to a backend -- nothing shown here is real."
          className="flex-none rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/30"
        >
          Sample data
        </span>
      )}
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          Test user
        </span>
      </div>
    </header>
  );
}
