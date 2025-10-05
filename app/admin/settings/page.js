'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, updateUserCommissionRate, updateGlobalCommissionRate } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Settings, DollarSign, Users, Save, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [globalRate, setGlobalRate] = useState(0.10); // Default 10%
  const [userRates, setUserRates] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getAllUsers();
        setUsers(userData);
        
        // Initialize user rates
        const rates = {};
        userData.forEach(user => {
          rates[user.id] = user.commissionRate || 0.10;
        });
        setUserRates(rates);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleGlobalRateChange = (e) => {
    const value = parseFloat(e.target.value) / 100;
    if (!isNaN(value) && value >= 0 && value <= 1) {
      setGlobalRate(value);
    }
  };

  const handleUserRateChange = (userId, value) => {
    const rate = parseFloat(value) / 100;
    if (!isNaN(rate) && rate >= 0 && rate <= 1) {
      setUserRates(prev => ({
        ...prev,
        [userId]: rate
      }));
    }
  };

  const handleUpdateSingleRate = async (userId, newRate) => {
    setUpdating(true);
    try {
      await updateUserCommissionRate(userId, newRate);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, commissionRate: newRate } : user
      ));
      
      setUserRates(prev => ({
        ...prev,
        [userId]: newRate
      }));
    } catch (error) {
      console.error('Error updating user commission rate:', error);
      alert('Failed to update commission rate: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateGlobalRate = async () => {
    setUpdating(true);
    try {
      await updateGlobalCommissionRate(globalRate);
      
      // Update all users in local state
      setUsers(prev => prev.map(user => ({
        ...user,
        commissionRate: globalRate
      })));
      
      // Update all user rates
      const newRates = {};
      users.forEach(user => {
        newRates[user.id] = globalRate;
      });
      setUserRates(newRates);
      
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error updating global commission rate:', error);
      alert('Failed to update global commission rate: ' + error.message);
    } finally {
      setUpdating(false);
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
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-3 mr-4">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
              <p className="mt-2 text-gray-600">
                Configure commission rates and platform settings
              </p>
            </div>
          </div>
        </div>

        {/* Global Commission Rate Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Commission Settings</h2>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                Changing the global commission rate will update all sellers' commission rates.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="globalRate" className="block text-sm font-medium text-gray-700 mb-2">
                Global Commission Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="globalRate"
                  value={globalRate * 100}
                  onChange={handleGlobalRateChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="block w-full pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Current global rate: {(globalRate * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setShowConfirmation(true)}
                disabled={updating}
                className="w-full md:w-auto px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
              >
                {updating ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update All Sellers
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Individual User Commission Rates */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Seller Commission Rates</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Rate (%)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.filter(user => user.role === 'user').map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.email || user.userId.substring(0, 8) + '...'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email || user.userId.substring(0, 8) + '...'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {(user.commissionRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <input
                          type="number"
                          value={(userRates[user.id] || 0) * 100}
                          onChange={(e) => handleUserRateChange(user.id, e.target.value)}
                          min="0"
                          max="100"
                          step="0.1"
                          className="block w-full pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleUpdateSingleRate(user.id, userRates[user.id] || 0)}
                        disabled={updating}
                        className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Global Update</h3>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
                  <p className="text-sm text-gray-600">
                    Are you sure you want to update the commission rate for all sellers to {globalRate * 100}%?
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateGlobalRate}
                    disabled={updating}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  >
                    {updating ? (
                      <span className="flex items-center">
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Confirm Update'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}