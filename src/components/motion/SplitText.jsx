"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * SplitText — divide o texto em palavras e anima cada uma com stagger.
 * Bom para títulos hero com entrada elegante.
 */
export default function SplitText({
  text,
  as: Tag = "h1",
  className = "",
  delay = 0,
  stagger = 0.06,
  duration = 0.9,
}) {
  const reduce = useReducedMotion();
  const words = String(text || "").split(" ");

  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } },
  };
  const child = {
    hidden:  { opacity: 0, y: reduce ? 0 : 28, filter: reduce ? "none" : "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration, ease: [0.22, 1, 0.36, 1] } },
  };

  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block will-change-transform mr-[0.25em] last:mr-0"
          aria-hidden="true"
        >
          {w}
        </motion.span>
      ))}
    </MotionTag>
  );
}
