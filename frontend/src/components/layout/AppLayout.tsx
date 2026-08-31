import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { ToastViewport } from '../ui/Toast';

interface AppLayoutProps {
  projectName: string;
  children: ReactNode;
}

export function AppLayout({ projectName, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar projectName={projectName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="">{children}</div>
        </main>
        <Footer />
      </div>
      <ToastViewport />
    </div>
  );
}
