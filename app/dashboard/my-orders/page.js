'use client';

import { useState, useEffect } from 'react';
import { getUserOrders } from '../../../lib/firestore';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { ShoppingCart, Calendar, DollarSign, MapPin, Clock, CheckCircle, AlertCircle, Truck } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function MyOrdersPageContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch orders where user is the buyer
        const userOrders = await getUserOrders(currentUser.uid, true); // isBuyer = true
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track your orders and delivery status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmed</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Delivered</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <div className="mt-6">
              <a
                href="/dashboard/home"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
              >
                Browse Products
              </a>
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-200 rounded-md p-2">
                          <ShoppingCart className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              Order #{order.id.substring(0, 8)}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : order.status === 'confirmed' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center text-sm text-gray-500">
                            <div className="flex items-center mr-4">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>${order.price}</span>
                            </div>
                            <div className="flex items-center mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{new Date(order.timestamp?.toDate()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>Delivery</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center">
                      <button className="ml-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Order Placed</span>
                      <span>Confirmed</span>
                      <span>Delivered</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex items-center">
                        <div className={`flex-auto ${order.status === 'pending' ? 'bg-gray-200' : 'bg-orange-500'} h-1 rounded-l`}></div>
                        <div className={`flex-auto ${order.status === 'confirmed' ? 'bg-orange-500' : order.status === 'delivered' ? 'bg-orange-500' : 'bg-gray-200'} h-1`}></div>
                        <div className={`flex-auto ${order.status === 'delivered' ? 'bg-orange-500' : 'bg-gray-200'} h-1 rounded-r`}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          order.status === 'pending' || order.status === 'confirmed' || order.status === 'delivered' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200'
                        }`}>
                          {order.status === 'pending' || order.status === 'confirmed' || order.status === 'delivered' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          order.status === 'confirmed' || order.status === 'delivered' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200'
                        }`}>
                          {order.status === 'confirmed' || order.status === 'delivered' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          order.status === 'delivered' 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-200'
                        }`}>
                          {order.status === 'delivered' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                      </div>
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

export default function MyOrdersPage() {
  return <MyOrdersPageContent />;
}