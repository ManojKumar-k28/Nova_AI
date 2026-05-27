import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function CursorAura() {
  const [hasPointer, setHasPointer] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 90, damping: 24, mass: 0.4 });
  const smoothY = useSpring(y, { stiffness: 90, damping: 24, mass: 0.4 });
  const translateX = useTransform(smoothX, (value) => value - 220);
  const translateY = useTransform(smoothY, (value) => value - 220);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        setHasPointer(true);
      }
      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[440px] w-[440px] rounded-full opacity-0 mix-blend-screen blur-3xl"
      animate={{ opacity: hasPointer ? 0.34 : 0 }}
      transition={{ duration: 0.35 }}
      style={{
        x: translateX,
        y: translateY,
        background:
          "radial-gradient(circle, rgba(34,211,238,0.4) 0%, rgba(59,130,246,0.22) 38%, rgba(139,92,246,0.12) 62%, transparent 72%)"
      }}
    />
  );
}
