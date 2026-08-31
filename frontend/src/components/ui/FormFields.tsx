import { type ReactNode } from 'react';

interface FieldShellProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function FieldShell({ label, htmlFor, required, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

const inputClasses =
  'block w-full rounded-md border-0 px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-500';

interface BaseFieldProps {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function TextField({
  name,
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  placeholder,
}: BaseFieldProps & { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <input
        id={name}
        name={name}
        type="text"
        className={inputClasses}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function NumberField({
  name,
  label,
  value,
  onChange,
  required,
  error,
  disabled,
}: BaseFieldProps & { value: number | ''; onChange: (v: number | '') => void }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <input
        id={name}
        name={name}
        type="number"
        className={inputClasses}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </FieldShell>
  );
}

export function DateField({
  name,
  label,
  value,
  onChange,
  required,
  error,
  disabled,
}: BaseFieldProps & { value: string; onChange: (v: string) => void }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <input
        id={name}
        name={name}
        type="date"
        className={inputClasses}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  required,
  error,
  disabled,
}: BaseFieldProps & { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <select
        id={name}
        name={name}
        className={inputClasses}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface FKOption {
  value: string;
  label: string;
}

export function FKSelectField({
  name,
  label,
  value,
  onChange,
  options,
  required,
  error,
  disabled,
}: BaseFieldProps & { value: string; onChange: (v: string) => void; options: FKOption[] }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <select
        id={name}
        name={name}
        className={inputClasses}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  value,
  onChange,
  required,
  error,
  disabled,
}: BaseFieldProps & { value: string; onChange: (v: string) => void }) {
  return (
    <FieldShell label={label} htmlFor={name} required={required} error={error}>
      <textarea
        id={name}
        name={name}
        rows={3}
        className={inputClasses}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  value,
  onChange,
  disabled,
}: BaseFieldProps & { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
      />
      {label}
    </label>
  );
}
