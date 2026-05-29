'use client';
import Link from 'next/link';

interface Crumb { label: string; href?: string; }

interface BreadcrumbNavProps {
  items: Crumb[];
  className?: string;
}

export default function BreadcrumbNav({ items, className = '' }: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center gap-1.5 text-xs ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-[#64748B] hover:text-[#94A3B8] transition-colors no-underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[#E2E8F0] font-medium' : 'text-[#64748B]'}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
