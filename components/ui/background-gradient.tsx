import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <div
      className={cn(
        "relative p-[2px] group rounded-2xl",
        /* Mobile: static emerald frame (bold, no animated layers) — confident focal strip */
        "max-[640px]:rounded-[15px] max-[640px]:p-[3px]",
        "max-[640px]:bg-[linear-gradient(145deg,#5eead4_0%,#22c55e_22%,#10b981_48%,#059669_72%,#065f46_100%)]",
        /* Outer stroke — same emerald language as desktop ring */
        "max-[640px]:ring-2 max-[640px]:ring-emerald-400/35",
        "max-[640px]:shadow-[0_14px_44px_-18px_rgba(16,185,129,0.55),0_0_0_1px_rgba(0,0,0,0.35)_inset]",
        "max-[640px]:motion-reduce:shadow-[0_8px_28px_-14px_rgba(16,185,129,0.4)]",
        containerClassName
      )}
    >
      <motion.div
        aria-hidden
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[0] opacity-70 group-hover:opacity-100 blur-2xl transition duration-500 will-change-transform max-[640px]:hidden",
          "shadow-[0_0_40px_rgba(16,185,129,0.3)]",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#34d399,transparent),radial-gradient(circle_farthest-side_at_100%_0,#10b981,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#059669,transparent),radial-gradient(circle_farthest-side_at_0_0,#6ee7b7,#020617)]"
        )}
      />
      <motion.div
        aria-hidden
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl z-[1] will-change-transform max-[640px]:hidden",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#34d399,transparent),radial-gradient(circle_farthest-side_at_100%_0,#10b981,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#059669,transparent),radial-gradient(circle_farthest-side_at_0_0,#6ee7b7,#020617)]"
        )}
      />

      <div
        className={cn(
          "relative z-10 rounded-[0.95rem] bg-[#050816]/95 border border-white/5 shadow-[0_18px_45px_rgba(2,6,23,0.85)]",
          /* Desktop: stronger inset ring — composer reads as primary control */
          "min-[641px]:ring-2 min-[641px]:ring-inset min-[641px]:ring-emerald-400/25",
          "min-[641px]:shadow-[0_18px_45px_rgba(2,6,23,0.85),0_0_0_1px_rgba(52,211,153,0.12),0_0_48px_-20px_rgba(16,185,129,0.22)]",
          /* Mobile: same inset emerald ring as desktop (min-[641px]) */
          "max-[640px]:rounded-[11px] max-[640px]:border-0",
          "max-[640px]:ring-2 max-[640px]:ring-inset max-[640px]:ring-emerald-400/25",
          "max-[640px]:bg-[linear-gradient(168deg,rgba(6,12,24,0.99)_0%,rgba(3,7,16,1)_45%,rgba(2,6,14,1)_100%)]",
          "max-[640px]:shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2),inset_0_2px_24px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.06),0_0_48px_-20px_rgba(16,185,129,0.22)]",
          "max-[640px]:transition-[box-shadow,filter] max-[640px]:duration-300 max-[640px]:ease-[cubic-bezier(0.25,1,0.5,1)] max-[640px]:motion-reduce:transition-none",
          "max-[640px]:focus-within:shadow-[inset_0_0_0_1px_rgba(110,231,183,0.42),inset_0_0_28px_-8px_rgba(16,185,129,0.12),0_0_0_2px_rgba(16,185,129,0.2)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
