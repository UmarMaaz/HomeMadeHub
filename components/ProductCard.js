import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Clock, MapPin, DollarSign } from 'lucide-react';

export default function ProductCard({ product }) {
  // Commission rate (10% by default)
  const commissionRate = 0.10;
  const adminCommission = product.price * commissionRate;
  const finalPrice = product.price + adminCommission;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover">
      <div className="relative h-52 w-full group">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 mx-auto flex items-center justify-center">
                <span className="text-gray-500 text-3xl">🍽️</span>
              </div>
              <p className="text-gray-500 mt-3 text-sm font-medium">No Image</p>
            </div>
          </div>
        )}
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-red-50 group">
            <Heart className="h-4 w-4 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
            product.status === 'available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.status === 'available' ? 'Available' : 'Sold Out'}
          </span>
        </div>
        
        {/* Chef Badge */}
        <div className="absolute bottom-3 left-3 flex items-center bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
          <div className="bg-gray-200 border-2 border-dashed rounded-full w-6 h-6 flex items-center justify-center mr-2">
            <span className="text-gray-500 text-xs">👨‍🍳</span>
          </div>
          <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
            {product.ownerId.substring(0, 4)}...
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-2">{product.title}</h3>
          <div className="flex items-center bg-amber-50 rounded-full px-2 py-1">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-amber-700 ml-1">4.8</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
        
        {/* Info Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center bg-gray-50 rounded-full px-3 py-1">
            <Clock className="h-3 w-3 text-gray-500 mr-1" />
            <span className="text-xs text-gray-600">30 min</span>
          </div>
          <div className="flex items-center bg-gray-50 rounded-full px-3 py-1">
            <MapPin className="h-3 w-3 text-gray-500 mr-1" />
            <span className="text-xs text-gray-600">2.5 km</span>
          </div>
        </div>
        
        {/* Pricing Information */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
            <span className="text-gray-600">Seller Receives:</span>
            <span className="font-medium text-green-600">PKR {product.sellerPrice?.toFixed(2) || product.price.toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mt-1 gap-1">
            <span className="text-gray-600">Admin Commission:</span>
            <span className="font-medium text-blue-600">PKR {(product.adminCommission || adminCommission).toFixed(2)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200 gap-1">
            <span>Final Price:</span>
            <span className="text-orange-600">PKR {(product.finalPrice || finalPrice).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-orange-600">${finalPrice.toFixed(2)}</span>
            <span className="text-gray-500 text-sm ml-1">/serving</span>
          </div>
          
          <Link
            href={`/product/${product.id}`}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-105"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            <span>Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
}