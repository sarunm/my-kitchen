import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kitchen Order Tracker',
  description: 'Track food delivery orders from Grab, Line-Man, and Shopee',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="navbar-title">🍽️ Kitchen Order Tracker</h1>
            <ul className="navbar-menu">
              <li><a href="/">Manage Orders</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
            </ul>
          </div>
        </nav>
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}
