'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDoc, doc, getProducts, createOrder } from '../../../lib/firestore';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import LocationSelector from '../../../components/LocationSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/Dialog';
import { MapPin, ShoppingCart, Star, Clock, User, CheckCircle, Truck, AlertCircle } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function ProductDetailPageContent() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [orderPlacing, setOrderPlacing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // In a real app, we'd fetch the specific product by ID
        // For now, we'll get all products and find the one with the matching ID
        const allProducts = await getProducts();
        const foundProduct = allProducts.find(p => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          router.push('/dashboard/home');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/dashboard/home');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  const handleBuyNow = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setShowLocationModal(true);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleConfirmOrder = async () => {
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }

    setOrderPlacing(true);
    try {
      // Create the order
      await createOrder({
        buyerId: currentUser.uid,
        sellerId: product.ownerId,
        productId: product.id,
        price: product.price,
        buyerLocation: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        }
      });

      // Redirect to my orders
      router.push('/dashboard/my-orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setOrderPlacing(false);
      setShowLocationModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/dashboard/home" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Home
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <a href="#" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Product</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{product.title.substring(0, 20)}{product.title.length > 20 ? '...' : ''}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-96 lg:h-[500px]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-full h-full flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto flex items-center justify-center mb-4">
                      <span className="text-gray-500 text-4xl">🍽️</span>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm">No Image Available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400 text-lg">🍽️</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">(128 reviews)</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-1" />
                  <span className="text-gray-600">Ready in 30 mins</span>
                </div>
              </div>
              
              <div className="flex items-center mb-8">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  <span className="font-medium">Chef:</span> {product.ownerId.substring(0, 8)}...
                </span>
              </div>
              
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing and Actions */}
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Seller Receives</p>
                    <p className="text-xl font-bold text-green-600">PKR {product.sellerPrice?.toFixed(2) || product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Admin Commission</p>
                    <p className="text-xl font-bold text-blue-600">PKR {(product.adminCommission || (product.price * 0.10)).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Final Price</p>
                    <p className="text-xl font-bold text-orange-600">PKR {(product.finalPrice || (product.price * 1.10)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-4xl font-bold text-gray-900">PKR {(product.finalPrice || (product.price * 1.10)).toFixed(2)}</span>
                  <span className="text-gray-500 ml-2">per serving</span>
                </div>
                
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status === 'available' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Available
                      </>
                    ) : (
                      'Sold Out'
                    )}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Truck className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Free delivery within 5km</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Estimated delivery: 30-45 minutes</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                  <span>Freshly prepared upon order</span>
                </div>
              </div>
              
              <div className="mt-10">
                <button
                  onClick={handleBuyNow}
                  disabled={product.status !== 'available' || orderPlacing}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center ${
                    product.status === 'available' && !orderPlacing
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {orderPlacing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      {product.status === 'available' ? 'Order Now' : 'Not Available'}
                    </>
                  )}
                </button>
                
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    Secure payment • Satisfaction guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          <div className="space-y-8">
            {[1, 2, 3].map((review) => (
              <div key={review} className="border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                <div className="flex items-start">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Happy Customer {review}</h3>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">2 days ago</p>
                    <p className="text-gray-700 mt-3">
                      Absolutely amazing! The flavors were incredible and the presentation was beautiful. 
                      Will definitely order again. Highly recommend this chef!
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              Load More Reviews
            </button>
          </div>
        </div>

        {/* Location Selection Modal */}
        <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <MapPin className="h-6 w-6 text-orange-500 mr-2" />
                Select Delivery Location
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-gray-600 mb-6">
                Please select your delivery location on the map below. This will help us calculate the best route for your order.
              </p>
              <LocationSelector onLocationSelect={handleLocationSelect} />
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={!selectedLocation || orderPlacing}
                  className={`px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 flex items-center ${
                    !selectedLocation || orderPlacing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg'
                  }`}
                >
                  {orderPlacing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

export default function ProductDetailPage() {
  return <ProductDetailPageContent />;
}