"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Icon } from "@/components/icon";

export default function ThemeSwitcher({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button type="button" className="icon-btn" aria-label={label} aria-pressed={dark} onClick={() => setTheme(dark ? "light" : "dark")}>
      <Icon name={dark ? "i-sun" : "i-moon"} />
    </button>
  );
}
