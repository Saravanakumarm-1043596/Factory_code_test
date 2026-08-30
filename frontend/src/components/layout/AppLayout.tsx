import { type ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { ToastViewport } from '../ui/Toast';

interface AppLayoutProps {
  projectName: string;
  children: ReactNode;
}

export function AppLayout({ projectName, children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      <TopNav projectName={projectName} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Footer />
      <ToastViewport />
    </div>
  );
}
