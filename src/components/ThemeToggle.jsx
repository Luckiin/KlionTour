"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${theme === "dark" ? "claro" : "escuro"}`}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center
        border border-surface-border dark:border-surface-dark-border
        bg-white/70 dark:bg-surface-dark-elevated/70
        text-brand-900 dark:text-brand-200
        hover:bg-brand-500/10 dark:hover:bg-brand-300/10
        transition-colors backdrop-blur
        ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
