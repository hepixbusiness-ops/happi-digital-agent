"use client";

import { motion } from "motion/react";
import { CircleNotch } from "@phosphor-icons/react";
import type { ButtonHTMLAttributes } from "react";

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: "primary" | "ghost";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-accent text-surface hover:bg-accent-strong disabled:hover:bg-accent",
    ghost: "bg-transparent text-ink border border-line-strong hover:bg-surface-raised",
  };

  return (
    <motion.button
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <CircleNotch className="animate-spin" size={18} weight="bold" aria-hidden />}
      {children}
    </motion.button>
  );
}
