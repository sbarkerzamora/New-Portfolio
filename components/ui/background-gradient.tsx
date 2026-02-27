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
        // Thin border with softer (less round) corners
        "relative p-[2px] group rounded-2xl",
        containerClassName
      )}
    >
      <motion.div
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
          // Soft outer glow below the card
          "absolute inset-0 rounded-2xl z-[0] opacity-70 group-hover:opacity-100 blur-2xl transition duration-500 will-change-transform",
          "shadow-[0_0_45px_rgba(34,211,238,0.35)]",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#22e3c3,transparent),radial-gradient(circle_farthest-side_at_100%_0,#22d3ee,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#38bdf8,transparent),radial-gradient(circle_farthest-side_at_0_0,#0ea5e9,#020617)]"
        )}
      />
      <motion.div
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
          // Crisp gradient border just under the content
          "absolute inset-0 rounded-2xl z-[1] will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#22e3c3,transparent),radial-gradient(circle_farthest-side_at_100%_0,#22d3ee,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#38bdf8,transparent),radial-gradient(circle_farthest-side_at_0_0,#0ea5e9,#020617)]"
        )}
      />

      <div
        className={cn(
          // Inner card shell; keeps corners clean over the gradient
          "relative z-10 rounded-[0.95rem] bg-[#050816]/95 border border-white/5 shadow-[0_18px_45px_rgba(2,6,23,0.85)]",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
