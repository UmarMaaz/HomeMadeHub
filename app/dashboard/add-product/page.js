'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { createProduct, getUserCommissionRate } from '../../../lib/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Upload, Camera, DollarSign, FileText, Tag, MapPin, Eye, EyeOff } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function AddProductPageContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [commissionRate, setCommissionRate] = useState(0.10); // Default 10%
  const router = useRouter();
  const { currentUser } = useAuth();
  const storage = getStorage();

  // Fetch user's commission rate
  useEffect(() => {
    const fetchCommissionRate = async () => {
      try {
        if (currentUser) {
          const rate = await getUserCommissionRate(currentUser.uid);
          setCommissionRate(rate);
        }
      } catch (error) {
        console.error('Error fetching commission rate:', error);
      }
    };

    fetchCommissionRate();
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !price) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!image) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Calculate prices
      const sellerPrice = parseFloat(price);
      const adminCommission = sellerPrice * commissionRate;
      const finalPrice = sellerPrice + adminCommission;

      // Create product in Firestore
      await createProduct(currentUser.uid, {
        title,
        description,
        price: sellerPrice,
        adminCommission: adminCommission,
        finalPrice: finalPrice,
        imageUrl: downloadURL
      });

      router.push('/dashboard/my-products');
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Calculate prices in real-time
  const sellerPrice = parseFloat(price) || 0;
  const adminCommission = sellerPrice * commissionRate;
  const finalPrice = sellerPrice + adminCommission;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Add New Product
              </h1>
              <p className="text-orange-100">
                Share your delicious homemade creation with the community
              </p>
            </div>
          </div>
          
          <div className="px-6 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>{error}</div>
              </div>
            )}
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Product Details */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-orange-500" />
                      Product Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-20 focus:border-transparent transition-colors"
                        placeholder="Enter product title"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-orange-500" />
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-20 focus:border-transparent transition-colors"
                        placeholder="Describe your product in detail..."
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                      Seller Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.01"
                        min="0"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500 focus:ring-opacity-20 focus:border-transparent transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Seller Receives:</span>
                        <span className="font-medium text-green-600">${sellerPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Admin Commission ({(commissionRate * 100).toFixed(0)}%):</span>
                        <span className="font-medium text-blue-600">${adminCommission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                        <span>Final Price:</span>
                        <span className="text-orange-600">${finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <p>* Commission rate may vary based on admin settings</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-orange-500" />
                      Product Image
                    </label>
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-xl">
                      {imagePreview ? (
                        <div className="relative w-full h-64">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImage(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 text-center">
                          <div className="mx-auto bg-gray-100 rounded-full p-3 w-12 h-12 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="image"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          {image && <p className="text-sm text-gray-700 truncate">{image.name}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {image && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-md flex items-center justify-center">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {image.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(image.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Location Information */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-amber-600 mr-2" />
                      <h3 className="text-sm font-medium text-amber-800">Location Tracking</h3>
                    </div>
                    <p className="mt-2 text-sm text-amber-700">
                      Your location will be automatically captured when you upload this product. 
                      Buyers will see your approximate location for delivery coordination.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 flex items-center"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AddProductPage() {
  return <AddProductPageContent />;
}