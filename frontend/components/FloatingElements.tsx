import React from 'react';
import { motion } from 'framer-motion';

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Floating geometric shapes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Floating hexagons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`hex-${i}`}
          className="absolute w-8 h-8 border border-purple-400/20 opacity-20"
          style={{
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
          }}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
