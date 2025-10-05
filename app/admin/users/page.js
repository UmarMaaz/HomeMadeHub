'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, banUser } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { AuthProvider } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { User, Shield, MapPin, Calendar, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function AdminUsersPageContent() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'active') {
        result = result.filter(user => !user.banned);
      } else if (filter === 'banned') {
        result = result.filter(user => user.banned);
      } else if (filter === 'admin') {
        result = result.filter(user => user.role === 'admin');
      }
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filter, users]);

  const handleBanToggle = async (userId, currentBannedStatus) => {
    try {
      await banUser(userId, !currentBannedStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, banned: !currentBannedStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user ban status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all platform users
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors appearance-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="banned">Banned Only</option>
                <option value="admin">Admin Only</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Total: {filteredUsers.length}
                </span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">
                  Active: {filteredUsers.filter(u => !u.banned).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'There are no users in the system yet'}
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          /* Users List */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Platform Users</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-200 rounded-full p-2">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.name || 'Unnamed User'}
                            </h3>
                            {user.role === 'admin' && (
                              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Admin
                              </span>
                            )}
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.banned 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.banned ? 'Banned' : 'Active'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{user.email}</p>
                          
                          <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                Joined: {user.createdAt ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center mr-6">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Location: {user.address || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <Shield className="h-4 w-4 mr-1" />
                              <span>Role: {user.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center">
                      <button
                        onClick={() => handleBanToggle(user.id, user.banned)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                          user.banned 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
                        } transition-all duration-200 shadow-md hover:shadow-lg`}
                      >
                        {user.banned ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unban User
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Ban User
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthProvider>
      <AdminUsersPageContent />
    </AuthProvider>
  );
}