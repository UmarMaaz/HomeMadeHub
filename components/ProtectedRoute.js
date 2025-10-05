'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChefHat, Lock } from 'lucide-react';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication after component mounts
    if (!currentUser) {
      router.push('/login');
    } else if (adminOnly && !isAdmin) {
      router.push('/dashboard'); // Redirect non-admins to user dashboard
    } else {
      setLoading(false);
    }
  }, [currentUser, isAdmin, router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Loading...</h2>
          <p className="text-gray-600 mt-2">Preparing your delicious experience</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}