'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '../../../../lib/firestore';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import OrderMap from '../../../../components/OrderMap';
import { MapPin, Calendar, DollarSign, User, CheckCircle, Clock, Truck, ArrowLeft, Navigation } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id);
        if (orderData) {
          setOrder(orderData);
        } else {
          console.error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    
    try {
      await updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => window.history.back()} 
                className="mr-4 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="mt-2 text-gray-600">Order #{order.id.substring(0, 8)}</p>
              </div>
            </div>
            
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              order.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : order.status === 'confirmed' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
            }`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium">PKR {order.price?.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {order.timestamp ? new Date(order.timestamp?.toDate()).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Buyer ID</p>
                    <p className="font-medium">{order.buyerId?.substring(0, 8)}...</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Seller ID</p>
                    <p className="font-medium">{order.sellerId?.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center mb-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <h3 className="font-medium text-gray-900">Seller Location</h3>
                  </div>
                  {order.sellerLocation ? (
                    <div className="text-sm">
                      <p className="text-gray-600">Lat: {order.sellerLocation.latitude.toFixed(6)}</p>
                      <p className="text-gray-600">Lng: {order.sellerLocation.longitude.toFixed(6)}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not available</p>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-center mb-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                    <h3 className="font-medium text-gray-900">Buyer Location</h3>
                  </div>
                  {order.buyerLocation ? (
                    <div className="text-sm">
                      <p className="text-gray-600">Lat: {order.buyerLocation.latitude.toFixed(6)}</p>
                      <p className="text-gray-600">Lng: {order.buyerLocation.longitude.toFixed(6)}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not available</p>
                  )}
                </div>
              </div>
              
              {/* Map */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Delivery Route</h3>
                {order.buyerLocation && order.sellerLocation ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden h-96">
                    <OrderMap 
                      buyerLocation={order.buyerLocation} 
                      sellerLocation={order.sellerLocation} 
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Location data not available for route visualization</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Controls */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
              
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                  >
                    {updatingStatus ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    )}
                    Confirm Order
                  </button>
                )}
                
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange('delivered')}
                    disabled={updatingStatus}
                    className="w-full px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center"
                  >
                    {updatingStatus ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Truck className="h-5 w-5 mr-2" />
                    )}
                    Mark as Delivered
                  </button>
                )}
                
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center justify-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Get Directions
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">PKR {order.price?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">PKR 0.00</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg text-orange-600">PKR {order.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}