import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/': 'Home',
  '/firewall-rule-sets': 'Firewall Rule Sets',
  '/firewall-rules': 'Firewall Rules',
  '/rule-issues': 'Rule Issues',
  '/change-requests': 'Change Requests',
  '/audit-scans': 'Audit Scans',
  '/scan-findings': 'Scan Findings',
  '/protected-systems': 'Protected Systems',
  '/network-security-groups': 'Network Security Groups',
  '/appliances': 'Appliances',
  '/compliance-mappings': 'Compliance Mappings',
};

export function Topbar() {
  const location = useLocation();
  const title = TITLES[location.pathname] ?? 'Overview';
  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
      {(import.meta.env.VITE_DATA_SOURCE ?? 'mock').toLowerCase() !== 'live' && (
        <span
          title="Sample data. This preview is not connected to a backend -- nothing shown here is real."
          className="flex-none rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/30"
        >
          Sample data
        </span>
      )}
      </div>
    </header>
  );
}
