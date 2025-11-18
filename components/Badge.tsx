import React from 'react';

interface BadgeProps {
  variant?: 'live' | 'default' | 'hd';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '' }) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide";
  
  const variants = {
    live: "bg-app-live/10 text-red-500 border border-red-500/20 animate-pulse",
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700",
    hd: "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500 block" />
      )}
      {children}
    </span>
  );
};
