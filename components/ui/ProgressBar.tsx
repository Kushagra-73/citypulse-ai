'use client';

import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'accent' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  labelLeft?: string;
  labelRight?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabels = false,
  labelLeft,
  labelRight,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantStyles = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabels && (labelLeft || labelRight) && (
        <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
          <span>{labelLeft}</span>
          <span>{labelRight || `${percentage}%`}</span>
        </div>
      )}
      <div className={`w-full bg-input rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
