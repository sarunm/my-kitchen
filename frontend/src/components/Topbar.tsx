'use client';

import Link from 'next/link';

interface TopbarProps {
  subtitle: string;
  active: 'manage' | 'dashboard';
  right?: React.ReactNode;
}

export function Topbar({ subtitle, active, right }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">🍲</div>
        <div>
          <h1>ลองแล แกงใต้</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="topmeta">
        <nav className="nav">
          <Link href="/" className={active === 'manage' ? 'active' : ''}>
            📋 จัดการ
          </Link>
          <Link
            href="/dashboard"
            className={active === 'dashboard' ? 'active' : ''}
          >
            🛵 จอไรเดอร์
          </Link>
        </nav>
        {right}
      </div>
    </header>
  );
}
