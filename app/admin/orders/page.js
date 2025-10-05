'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { MapPin, Calendar, DollarSign, User, CheckCircle, Clock, Truck, Search, Filter, Eye, Navigation } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await getAllOrders();
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.sellerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(order => order.status === filter);
    }
    
    setFilteredOrders(result);
  }, [searchTerm, filter, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + error.message);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all platform transactions
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
                placeholder="Search orders..."
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
                <option value="all">All Orders</option>
                <option value="pending">Pending Only</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="delivered">Delivered Only</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Total: {filteredOrders.length}
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">
                  Delivered: {filteredOrders.filter(o => o.status === 'delivered').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'There are no orders in the system yet'}
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
          /* Orders List */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Platform Orders</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-200 rounded-md p-2">
                          <Truck className="h-6 w-6 text-gray-600" />
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
                              <span className="font-medium text-gray-900">${order.price}</span>
                            </div>
                            <div className="flex items-center mr-4">
                              <User className="h-4 w-4 mr-1" />
                              <span>Buyer: {order.buyerId.substring(0, 8)}...</span>
                            </div>
                            <div className="flex items-center mr-4">
                              <User className="h-4 w-4 mr-1" />
                              <span>Seller: {order.sellerId.substring(0, 8)}...</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{order.timestamp ? new Date(order.timestamp?.toDate()).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                          
                          {/* Location Information */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Buyer Location: {order.buyerLocation ? `${order.buyerLocation.latitude.toFixed(4)}, ${order.buyerLocation.longitude.toFixed(4)}` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                              <span>Seller Location: {order.sellerLocation ? `${order.sellerLocation.latitude.toFixed(4)}, ${order.sellerLocation.longitude.toFixed(4)}` : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Map Preview */}
                      <div className="mt-4">
                        {order.buyerLocation && order.sellerLocation ? (
                          <div className="border border-gray-200 rounded-lg overflow-hidden h-64">
                            <iframe
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyDGU-fCTyFVITYwM0fC00uzJtDxHnDNS3s&origin=${order.sellerLocation.latitude},${order.sellerLocation.longitude}&destination=${order.buyerLocation.latitude},${order.buyerLocation.longitude}&avoid=tolls|highways`}
                            ></iframe>
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Location data not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'confirmed')}
                          disabled={updatingStatus[order.id]}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                            updatingStatus[order.id] 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                          } transition-all duration-200 shadow-md hover:shadow-lg`}
                        >
                          {updatingStatus[order.id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Confirm
                        </button>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          disabled={updatingStatus[order.id]}
                          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                            updatingStatus[order.id] 
                              ? 'bg-gray-400 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          } transition-all duration-200 shadow-md hover:shadow-lg`}
                        >
                          {updatingStatus[order.id] ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Truck className="h-4 w-4 mr-2" />
                          )}
                          Deliver
                        </button>
                      )}
                      
                      <a href={`/admin/orders/${order.id}`} className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye className="h-5 w-5" />
                      </a>
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