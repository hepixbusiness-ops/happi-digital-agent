"use client";

import { motion } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delai?: number;
  as?: "div" | "li" | "article" | "figure";
};

// prefers-reduced-motion est géré globalement par <MotionConfig reducedMotion="user"> :
// le déplacement disparaît, seul le fondu reste.
export function Reveal({ children, className, delai = 0, as = "div" }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delai }}
    >
      {children}
    </Tag>
  );
}
