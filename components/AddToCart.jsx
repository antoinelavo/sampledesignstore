import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Check } from 'lucide-react';

const AddToCart = ({ item }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle quantity input change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value >= 1) {
      setQuantity(value);
    }
  };

  // Increase quantity
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Decrease quantity (minimum 1)
  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Add item to cart (localStorage)
  const addToCart = () => {
    setIsLoading(true);
    
    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Create cart item
      const cartItem = {
        id: `${item.id}-${Date.now()}`, // Unique cart item ID
        itemId: item.id,
        name: item.name,
        price: item.price,
        image: item.images && item.images[0] ? item.images[0] : '/images/placeholder.jpg',
        slug: item.slug,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };

      // Check if same item already exists in cart
      const existingItemIndex = existingCart.findIndex(
        cartItem => cartItem.itemId === item.id
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        existingCart.push(cartItem);
      }

      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch custom event to update cart icon
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Show success feedback
      setIsAdded(true);
      
      // Reset feedback after 2 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);

      console.log('Item added to cart:', cartItem);
      console.log('Updated cart:', existingCart);
      
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
      {/* Quantity Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <div className="flex items-center space-x-3">
          {/* Decrease Button */}
          <button
            onClick={decreaseQuantity}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={quantity <= 1}
          >
            <Minus size={16} className={quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
          </button>

          {/* Quantity Input */}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="w-20 h-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Increase Button */}
          <button
            onClick={increaseQuantity}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Unit Price:</span>
          <span className="font-medium">₩{item.price?.toLocaleString() || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
          <span className="text-gray-600">Total ({quantity} item{quantity > 1 ? 's' : ''}):</span>
          <span className="font-bold text-lg">
            ₩{item.price ? (item.price * quantity).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={addToCart}
        disabled={isLoading || isAdded}
        className={`w-full h-12 flex items-center justify-center space-x-2 rounded-lg font-medium transition-all duration-200 ${
          isAdded
            ? 'bg-green-600 text-white'
            : isLoading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Adding...</span>
          </>
        ) : isAdded ? (
          <>
            <Check size={20} />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            <span>Add to Cart</span>
          </>
        )}
      </button>

      {/* Additional Info */}
      <p className="text-xs text-gray-500 text-center mt-3">
        Free shipping on orders over ₩50,000
      </p>
    </div>
  );
};

export default AddToCart;