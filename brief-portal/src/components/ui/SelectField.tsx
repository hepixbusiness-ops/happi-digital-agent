"use client";

import { CaretDown } from "@phosphor-icons/react";
import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({
  label,
  error,
  required,
  options,
  placeholder = "Sélectionner…",
  id,
  className = "",
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="font-label text-xs text-ink-soft">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={!!error}
          className={`min-h-11 w-full appearance-none rounded-xl border bg-surface-raised px-4 py-3 pr-10 text-base text-ink transition-colors duration-150 focus:border-accent disabled:cursor-not-allowed disabled:bg-bg-base disabled:text-ink-faint ${
            error ? "border-error" : "border-line hover:border-line-strong"
          } ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <CaretDown
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint"
          size={16}
          weight="bold"
          aria-hidden
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
