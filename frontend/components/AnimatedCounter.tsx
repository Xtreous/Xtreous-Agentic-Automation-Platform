import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  from,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  className,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (endTime - startTime), 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(from + (to - from) * easeOutQuart);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [from, to, duration, isInView]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}
