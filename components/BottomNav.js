'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, Package, ShoppingCart, User, ChefHat } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  // Don't show bottom nav on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // User navigation items
  const navItems = [
    { name: 'Home', href: '/dashboard/home', icon: Home },
    { name: 'Add Dish', href: '/dashboard/add-product', icon: Plus },
    { name: 'My Items', href: '/dashboard/my-products', icon: Package },
    { name: 'My Orders', href: '/dashboard/my-orders', icon: ShoppingCart },
    { name: 'Chef Orders', href: '/dashboard/seller-orders', icon: ChefHat },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="grid grid-cols-5 gap-1 px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 text-xs rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'text-orange-600 bg-orange-50 font-bold' 
                  : 'text-gray-500 hover:text-orange-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={22} className="mb-1" />
              <span className="leading-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Floating Action Button for Add Product */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Link
          href="/dashboard/add-product"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl hover:from-orange-600 hover:to-amber-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-110"
        >
          <Plus size={28} />
        </Link>
      </div>
    </div>
  );
}