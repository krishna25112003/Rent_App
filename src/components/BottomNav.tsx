'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, FileText, Menu } from 'lucide-react';

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/properties', icon: Building2, label: 'Properties' },
    { href: '/reports', icon: FileText, label: 'Reports' },
    { href: '/menu', icon: Menu, label: 'Menu' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center max-w-screen-xl mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon className={`w-6 h-6 mb-1 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
