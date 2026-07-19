'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'info' | 'muted';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'xs',
  className = '',
}: BadgeProps) {
  const baseStyle = 'inline-flex items-center font-bold rounded-full border tracking-wide uppercase';
  
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[9px]',
    sm: 'px-2.5 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  const variantStyles = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    danger: 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse-glow',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    muted: 'text-muted bg-input border-card-border',
  };

  return (
    <span className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
