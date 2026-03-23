"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
};

export default function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const initialY = direction === "up" ? 40 : 0;
  const initialX =
    direction === "left" ? -40 : direction === "right" ? 40 : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: initialY, x: initialX }}
      animate={
        isInView
          ? { opacity: 1, y: 0, x: 0 }
          : { opacity: 0, y: initialY, x: initialX }
      }
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
