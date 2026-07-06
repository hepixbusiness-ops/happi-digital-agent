"use client";

import type { TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function TextareaField({
  label,
  hint,
  error,
  required,
  id,
  rows = 3,
  className = "",
  ...props
}: TextareaFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="font-label text-xs text-ink-soft">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <textarea
        id={fieldId}
        required={required}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={`w-full resize-y rounded-xl border bg-surface-raised px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors duration-150 focus:border-accent disabled:cursor-not-allowed disabled:bg-bg-base disabled:text-ink-faint ${
          error ? "border-error" : "border-line hover:border-line-strong"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
