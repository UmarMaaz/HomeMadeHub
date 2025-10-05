'use client';

import { useState, useEffect } from 'react';
import { getUserProducts, updateProduct, deleteProduct } from '../../../lib/firestore';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Link from 'next/link';
import { Plus, Package, ShoppingCart, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function MyProductsPageContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userProducts = await getUserProducts(currentUser.uid);
        setProducts(userProducts);
      } catch (error) {
        console.error('Error fetching user products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setProcessing(prev => ({ ...prev, [productId]: 'deleting' }));
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
      } finally {
        setProcessing(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });
      }
    }
  };

  const handleMarkAsSold = async (productId) => {
    setProcessing(prev => ({ ...prev, [productId]: 'updating' }));
    try {
      await updateProduct(productId, { status: 'sold' });
      setProducts(products.map(product => 
        product.id === productId ? { ...product, status: 'sold' } : product
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status: ' + error.message);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
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
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="mt-2 text-gray-600">
              Manage your food listings and track sales
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/dashboard/add-product"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Available</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
                <ShoppingCart className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Sold</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.status === 'sold').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first product!</p>
            <div className="mt-6">
              <Link
                href="/dashboard/add-product"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Product
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Listings</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="relative h-48 w-full">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                            <span className="text-gray-500 text-2xl">🍽️</span>
                          </div>
                          <p className="text-gray-500 mt-2 text-sm">No Image</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{product.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2 h-12">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-orange-600">${product.price}</span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      {product.status === 'available' && (
                        <button
                          onClick={() => handleMarkAsSold(product.id)}
                          disabled={processing[product.id] === 'updating'}
                          className="flex-1 flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processing[product.id] === 'updating' ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Sold
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={processing[product.id] === 'deleting'}
                        className="flex-1 flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {processing[product.id] === 'deleting' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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

export default function MyProductsPage() {
  return <MyProductsPageContent />;
}