'use client';

import React from "react";
import { cn } from "@/lib/utils";

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
};

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 3, className }) => {
  return (
    <span
      className={cn(
        "shiny-text bg-gradient-to-r from-[#7dd3fc] via-[#c084fc] to-[#f472b6] bg-[length:200%_100%] bg-clip-text text-transparent",
        !disabled && `animate-[shine_${speed}s_linear_infinite]`,
        className,
      )}
    >
      {text}
    </span>
  );
};

export default ShinyText;
