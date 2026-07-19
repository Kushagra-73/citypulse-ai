'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Award, 
  User, 
  Settings,
  Info
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/report', label: t('reportIssue'), icon: PlusCircle },
    { href: '/community', label: t('community'), icon: Users },
    { href: '/rewards', label: t('rewards'), icon: Award },
    { href: '/profile', label: t('profile'), icon: User },
    { href: '/settings', label: t('settings'), icon: Settings },
    { href: '/about', label: t('about'), icon: Info },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-card-border bg-card/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16 p-4 justify-between">
      <div className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'text-foreground/80 hover:bg-input hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

    </aside>
  );
}
