'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'warning' | 'default';
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export default function StatisticsCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  trendText,
  trendDirection = 'neutral',
}: StatisticsCardProps) {
  const iconColorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-amber-500/10 text-amber-500',
    default: 'bg-input text-muted-foreground',
  };

  const textColors = {
    primary: 'text-primary',
    accent: 'text-accent',
    warning: 'text-amber-500',
    default: 'text-foreground',
  };

  const trendColors = {
    up: 'text-accent',
    down: 'text-red-500',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="border border-card-border bg-card p-4 rounded-2xl space-y-2 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${iconColorClasses[variant]}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <div className="space-y-1">
        <div className={`text-2xl font-bold font-heading ${variant === 'default' ? 'text-foreground' : textColors[variant]}`}>
          {value}
        </div>
        {trendText && (
          <div className={`text-[9px] font-semibold flex items-center gap-1 ${trendColors[trendDirection]}`}>
            <span>{trendText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
