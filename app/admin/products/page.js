'use client';

import { useState, useEffect } from 'react';
import { getAllProducts, updateProduct, deleteProduct } from '../../../lib/firestore';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Package, DollarSign, User, Calendar, CheckCircle, XCircle, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(product => product.status === filter);
    }
    
    setFilteredProducts(result);
  }, [searchTerm, filter, products]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
      }
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'sold' : 'available';
      await updateProduct(productId, { status: newStatus });
      setProducts(products.map(product => 
        product.id === productId ? { ...product, status: newStatus } : product
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status: ' + error.message);
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
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage all food listings on the platform
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
                placeholder="Search products..."
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
                <option value="all">All Products</option>
                <option value="available">Available Only</option>
                <option value="sold">Sold Only</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Total: {filteredProducts.length}
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">
                  Available: {filteredProducts.filter(p => p.status === 'available').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'There are no products listed yet'}
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
          /* Products List */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Food Listings</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-gray-200 rounded-md p-2">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {product.title}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.status === 'available' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                          
                          <div className="mt-3 flex flex-wrap items-center text-sm text-gray-500">
                            <div className="flex items-center mr-6">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span className="font-medium text-gray-900">${product.price}</span>
                            </div>
                            <div className="flex items-center mr-6">
                              <User className="h-4 w-4 mr-1" />
                              <span>Seller: {product.ownerId.substring(0, 8)}...</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{product.createdAt ? new Date(product.createdAt?.toDate()).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-center space-x-3">
                      <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(product.id, product.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.status === 'available' 
                            ? 'text-red-500 hover:text-red-700 hover:bg-red-50' 
                            : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {product.status === 'available' ? (
                          <XCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
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