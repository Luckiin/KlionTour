"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — anima o filho aparecendo ao entrar na viewport.
 * direction: "up" | "down" | "left" | "right" | "fade"
 */
export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 28,
  once = true,
  as: Tag = "div",
  className = "",
  ...rest
}) {
  const reduce = useReducedMotion();

  const offset = {
    up:    { y:  distance, x: 0 },
    down:  { y: -distance, x: 0 },
    left:  { x:  distance, y: 0 },
    right: { x: -distance, y: 0 },
    fade:  { x: 0, y: 0 },
  }[direction] || { y: distance, x: 0 };

  const variants = {
    hidden:  { opacity: 0, ...(reduce ? {} : offset) },
    visible: { opacity: 1, x: 0, y: 0 },
  };

  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      variants={variants}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
