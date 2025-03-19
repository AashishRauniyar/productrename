"use client";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  currentTheme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ currentTheme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full ${
        currentTheme === "dark"
          ? "bg-yellow-400 text-black"
          : "bg-red-700 text-white"
      }`}
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
