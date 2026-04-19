"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";

/**
 * Counter — conta números ao entrar na viewport.
 * Suporta prefix/suffix. Ex.: <Counter to={4000} suffix="+" />
 */
export default function Counter({
  to = 100,
  from = 0,
  duration = 1.8,
  prefix = "",
  suffix = "",
  className = "",
  formatter,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const val = useMotionValue(from);
  const [display, setDisplay] = useState(formatter ? formatter(from) : `${from}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(val, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const rounded = Math.round(latest);
        setDisplay(formatter ? formatter(rounded) : `${rounded}`);
      },
    });
    return controls.stop;
  }, [inView, to, duration, val, formatter]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </motion.span>
  );
}
