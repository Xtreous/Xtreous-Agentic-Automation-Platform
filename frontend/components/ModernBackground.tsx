import React from 'react';

export function ModernBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-100" />
      
      {/* Organic flowing shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary organic shape */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 254, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)',
            borderRadius: '60% 40% 70% 30% / 60% 30% 70% 40%',
            transform: 'rotate(-15deg)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Secondary organic shape */}
        <div 
          className="absolute -bottom-32 -left-32 w-80 h-80 opacity-25"
          style={{
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.12) 0%, rgba(139, 69, 254, 0.08) 100%)',
            borderRadius: '40% 60% 30% 70% / 40% 70% 60% 30%',
            transform: 'rotate(25deg)',
            filter: 'blur(50px)',
          }}
        />
        
        {/* Tertiary accent shape */}
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 opacity-20"
          style={{
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
            borderRadius: '50% 30% 80% 20% / 30% 60% 40% 70%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
            filter: 'blur(60px)',
          }}
        />
      </div>
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(139, 69, 254, 0.15) 1px, transparent 0)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-40 animate-float"
            style={{
              background: 'linear-gradient(45deg, rgba(139, 69, 254, 0.6), rgba(236, 72, 153, 0.4))',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
