import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, Boxes as BoxesIcon, Building2 as Building2Icon, ClipboardList as ClipboardListIcon, Database as DatabaseIcon, FileText as FileTextIcon, Layers as LayersIcon, Tag as TagIcon, Users as UsersIcon } from 'lucide-react';
import clsx from 'clsx';
import { SENZAI_LOGO } from '../../brand';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/firewall-rule-sets', label: "Firewall Rule Sets", icon: UsersIcon },
  { to: '/firewall-rules', label: "Firewall Rules", icon: DatabaseIcon },
  { to: '/rule-issues', label: "Rule Issues", icon: LayersIcon },
  { to: '/change-requests', label: "Change Requests", icon: ClipboardListIcon },
  { to: '/audit-scans', label: "Audit Scans", icon: BoxesIcon },
  { to: '/scan-findings', label: "Scan Findings", icon: FileTextIcon },
  { to: '/protected-systems', label: "Protected Systems", icon: Building2Icon },
  { to: '/network-security-groups', label: "Network Security Groups", icon: TagIcon },
  { to: '/appliances', label: "Appliances", icon: UsersIcon },
  { to: '/compliance-mappings', label: "Compliance Mappings", icon: DatabaseIcon },
];

interface SidebarProps {
  projectName: string;
}

export function Sidebar({ projectName }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-none flex-col border-r border-slate-200 bg-slate-900">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden">
          <img src={SENZAI_LOGO} alt="SenzAI" className="h-6 w-auto" />
        </span>
        <span
          className="truncate text-sm font-semibold tracking-wide text-white"
          title={projectName}
        >
          SENZAI
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
              )
            }
          >
            <item.icon className="h-4 w-4 flex-none" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
