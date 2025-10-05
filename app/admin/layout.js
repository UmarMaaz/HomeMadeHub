'use client';

import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute adminOnly={true}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}