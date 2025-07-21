import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

const CartIcon = ({ className = '' }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Update cart count when component mounts and localStorage changes
  useEffect(() => {
    setIsClient(true);
    updateCartCount();

    // Listen for storage events (when cart is updated in other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom cart update events (same tab updates)
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error reading cart:', error);
      setCartCount(0);
    }
  };

  // Don't render anything on server-side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // Don't render when cart is empty
  if (cartCount === 0) {
    return null;
  }

  return (
    <Link href="/cart" className={`relative inline-flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}>
      <ShoppingCart size={24} className="text-gray-700" />
      
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
          {cartCount > 99 ? '99+' : cartCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;