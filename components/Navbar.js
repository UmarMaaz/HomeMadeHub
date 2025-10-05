'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, User, Menu, X, Package, ShoppingCart, ChefHat, Store } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation links for regular users
  const userNavLinks = [
    { name: 'Home', href: '/dashboard/home', icon: ShoppingBag },
    { name: 'Add Product', href: '/dashboard/add-product', icon: Package },
    { name: 'My Products', href: '/dashboard/my-products', icon: ChefHat },
    { name: 'My Orders', href: '/dashboard/my-orders', icon: ShoppingCart },
    { name: 'Seller Orders', href: '/dashboard/seller-orders', icon: Store },
  ];

  // Navigation links for admin users
  const adminNavLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: ShoppingBag },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <nav className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link href={isAdmin ? '/admin/dashboard' : '/dashboard/home'} className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2.5 rounded-full shadow-lg">
                  <ShoppingBag className="h-7 w-7 text-orange-500" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100">
                  Homemade Hub
                </span>
              </div>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      pathname === link.href 
                        ? 'bg-white bg-opacity-25 rounded-xl px-4 py-2.5' 
                        : 'hover:bg-white hover:bg-opacity-10 rounded-xl px-4 py-2.5'
                    } flex items-center space-x-2 text-sm font-medium transition-all duration-300`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block bg-white bg-opacity-20 rounded-full px-4 py-2">
                  <span className="flex items-center text-sm font-medium">
                    <User className="h-5 w-5 mr-2" />
                    {currentUser.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-full text-white hover:text-gray-200 hover:bg-orange-600 focus:outline-none transition-all duration-300 shadow-md"
              >
                {mobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-r from-orange-600 to-amber-600 bg-opacity-95 absolute top-full left-0 right-0 z-50 shadow-lg">
          <div className="px-4 pt-4 pb-6 space-y-2 max-h-[calc(100vh-80px)] overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href 
                      ? 'bg-white bg-opacity-25 rounded-xl px-4 py-3' 
                      : 'hover:bg-white hover:bg-opacity-10 rounded-xl px-4 py-3'
                  } block flex items-center space-x-3 text-base font-medium transition-all duration-300`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
            {currentUser && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 text-base font-medium flex items-center space-x-3"
              >
                <User className="h-6 w-6 flex-shrink-0" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}