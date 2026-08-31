import { useRef, useState, type DragEvent } from 'react';
import { Upload as UploadIcon, File as FileIcon, X as XIcon, Download as DownloadIcon } from 'lucide-react';

interface FileUploadFieldProps {
  name: string;
  label: string;
  value: string;
  fileLabel?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  accept: string[];
  maxSizeMb: number;
  onSelect: (file: File, dataUrl: string) => void;
  onRemove: () => void;
  downloadHref?: string;
}

// Mock mode has no server to store bytes on, so a selected file is read as a
// base64 data URL and handed to the caller -- the same string a real
// backend's `<field>_url` would occupy, so this component works unchanged
// whether the eventual value came from FileReader or the live API.
export function FileUploadField({
  name,
  label,
  value,
  fileLabel,
  required,
  error,
  disabled,
  accept,
  maxSizeMb,
  onSelect,
  onRemove,
  downloadHref,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function readAndSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => onSelect(file, String(reader.result ?? ''));
    reader.readAsDataURL(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) readAndSelect(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {value ? (
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <FileIcon className="h-4 w-4 flex-none text-slate-400" />
            <span className="truncate text-slate-700">{fileLabel || 'Uploaded file'}</span>
          </div>
          <div className="flex flex-none items-center gap-1">
            {downloadHref && (
              <a
                href={downloadHref}
                download={fileLabel || undefined}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                aria-label="Download"
              >
                <DownloadIcon className="h-4 w-4" />
              </a>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                aria-label="Remove"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed px-3 py-6 text-center text-sm transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <UploadIcon className="h-5 w-5 text-slate-400" />
          <span className="text-slate-600">Drag & drop or click to upload</span>
          <span className="text-xs text-slate-400">
            {accept.join(', ')} up to {maxSizeMb}MB
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept.join(',')}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readAndSelect(file);
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
