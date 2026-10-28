"use client";

import type { ChatOption } from "@/lib/schemas";

interface OptionChipsProps {
  options: ChatOption[];
  onOptionClick: (action: string, payload?: string) => void;
  align?: "left" | "right";
}

export default function OptionChips({
  options,
  onOptionClick,
  align = "left",
}: OptionChipsProps) {
  return (
    <div
      className={`flex flex-wrap gap-2 mt-2.5 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          id={`chip-${opt.id}`}
          onClick={() => onOptionClick(opt.action, opt.payload)}
          className={`
            px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200
            border backdrop-blur-md cursor-pointer select-none
            hover:scale-[1.03] active:scale-[0.97]
            ${
              opt.action === "open_booking"
                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 font-semibold"
                : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border-white/10"
            }
            whitespace-nowrap
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
