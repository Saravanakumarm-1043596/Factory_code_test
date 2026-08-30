import { useEffect, useState } from 'react';
import { CheckCircle2 as CheckCircle2Icon, XCircle as XCircleIcon, Info as InfoIcon, X as XIcon } from 'lucide-react';
import clsx from 'clsx';

type ToastVariant = 'success' | 'error' | 'info';
interface ToastMessage {
  id: number;
  variant: ToastVariant;
  text: string;
}

let toasts: ToastMessage[] = [];
let listeners: Array<(items: ToastMessage[]) => void> = [];
let counter = 0;

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(variant: ToastVariant, text: string) {
  const id = ++counter;
  toasts = [...toasts, { id, variant, text }];
  emit();
  setTimeout(() => dismiss(id), 3800);
}

export const toast = {
  success: (text: string) => push('success', text),
  error: (text: string) => push('error', text),
  info: (text: string) => push('info', text),
};

const ICONS: Record<ToastVariant, typeof CheckCircle2Icon> = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  info: InfoIcon,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function ToastViewport() {
  const [items, setItems] = useState<ToastMessage[]>(toasts);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((l) => l !== setItems);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {items.map((t) => {
        const Icon = ICONS[t.variant];
        return (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg',
              STYLES[t.variant],
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 flex-none" />
            <p className="flex-1">{t.text}</p>
            <button onClick={() => dismiss(t.id)} className="text-current/60 hover:text-current">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
