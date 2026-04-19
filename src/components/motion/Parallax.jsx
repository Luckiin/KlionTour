"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Parallax — move o conteúdo em Y conforme o scroll do pai.
 * Aplica offset vertical proporcional (amount = -100..100, default 60).
 */
export default function Parallax({
  children,
  amount = 60,
  className = "",
}) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);

  return (
    <motion.div
      ref={ref}
      style={{ y: reduce ? 0 : y, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
