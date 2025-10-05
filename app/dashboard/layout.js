'use client';

import Navbar from '../../components/Navbar';
import BottomNav from '../../components/BottomNav';
import { AuthProvider } from '../../contexts/AuthContext';

export default function UserLayout({ children }) {
  return (
    <AuthProvider>
      <div className="pb-16 md:pb-0 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}