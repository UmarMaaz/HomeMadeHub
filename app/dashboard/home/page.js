'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '../../../lib/firestore';
import ProductCard from '../../../components/ProductCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { useAuth } from '../../../contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Search, Filter, ChefHat, ShoppingCart, Star, MapPin, Utensils, Clock, Users } from 'lucide-react';

// Wrapper component to ensure AuthProvider is available
function HomePageContent() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const availableProducts = await getProducts('available');
        setProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || product.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Discover <span className="text-amber-200">Delicious</span> Homemade Food
              </h1>
              <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
                From family kitchens to your table. Taste the love in every bite.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for dishes, cuisines, or chefs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-5 py-5 text-lg border border-transparent rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30 shadow-xl"
                  />
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5">
                  <div className="flex items-center">
                    <Utensils className="h-8 w-8 text-amber-200 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">500+</p>
                      <p className="text-sm">Delicious Dishes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-amber-200 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">200+</p>
                      <p className="text-sm">Home Chefs</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-5">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-amber-200 mr-3" />
                    <div>
                      <p className="text-2xl font-bold">4.9</p>
                      <p className="text-sm">Avg. Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our diverse selection of homemade cuisine
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                { id: 'all', name: 'All Dishes', icon: Utensils },
                { id: 'italian', name: 'Italian', icon: ChefHat },
                { id: 'mexican', name: 'Mexican', icon: Star },
                { id: 'indian', name: 'Indian', icon: MapPin },
                { id: 'chinese', name: 'Chinese', icon: Clock },
                { id: 'dessert', name: 'Desserts', icon: ShoppingCart }
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`px-6 py-4 rounded-2xl text-base font-medium transition-all duration-300 flex items-center ${
                      filter === category.id
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform -translate-y-1'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'All Products' : 'Popular Dishes'}
              </h2>
              <p className="text-gray-600 mt-2">
                {filteredProducts.length} delicious options available
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600 bg-white rounded-full px-4 py-2 shadow-sm">
                <MapPin className="h-5 w-5 mr-1 text-orange-500" />
                <span className="text-sm">Near you</span>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-full w-32 h-32 flex items-center justify-center mb-8">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">No products found</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Trust Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">Why Choose Homemade Hub?</h2>
              <p className="text-xl text-amber-100 max-w-3xl mx-auto">
                We connect food lovers with passionate home cooks in their community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 hover:bg-opacity-20 transition-all duration-300">
                <div className="mx-auto bg-white bg-opacity-20 rounded-full p-5 w-20 h-20 flex items-center justify-center mb-6">
                  <ChefHat className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Authentic Home Cooking</h3>
                <p className="text-amber-100">
                  Taste the difference that passion and tradition make in every dish, prepared with love in home kitchens.
                </p>
              </div>
              
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 hover:bg-opacity-20 transition-all duration-300">
                <div className="mx-auto bg-white bg-opacity-20 rounded-full p-5 w-20 h-20 flex items-center justify-center mb-6">
                  <Star className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Quality Assured</h3>
                <p className="text-amber-100">
                  Every chef is rated by our community for consistent quality and taste, ensuring you get the best experience.
                </p>
              </div>
              
              <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 hover:bg-opacity-20 transition-all duration-300">
                <div className="mx-auto bg-white bg-opacity-20 rounded-full p-5 w-20 h-20 flex items-center justify-center mb-6">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Local & Fresh</h3>
                <p className="text-amber-100">
                  Support your neighbors and enjoy meals made with fresh, local ingredients sourced from nearby markets.
                </p>
              </div>
            </div>
            
            {/* CTA */}
            <div className="text-center mt-16">
              <h3 className="text-3xl font-bold mb-6">Ready to Taste Something Amazing?</h3>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a 
                  href="/dashboard/add-product" 
                  className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Become a Seller
                </a>
                <a 
                  href="#products" 
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-orange-600 transition-all duration-300"
                >
                  Browse Products
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function HomePage() {
  return (
    <HomePageContent />
  );
}