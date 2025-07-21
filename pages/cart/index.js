// pages/cart.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import ScrollHeader from '@/components/Header';
import Footer from '@/components/Footer';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // Track which item is being updated

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // Update localStorage whenever cartItems changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      // Dispatch custom event to update cart icon
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, [cartItems, loading]);

  // Update item quantity
  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(cartItemId);
    
    setTimeout(() => {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      setUpdating(null);
    }, 200);
  };

  // Remove item from cart
  const removeItem = (cartItemId) => {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      setCartItems(prevItems =>
        prevItems.filter(item => item.id !== cartItemId)
      );
    }
  };

  // Clear entire cart
  const clearCart = () => {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      setCartItems([]);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    return total + (price * item.quantity);
  }, 0);

  const shipping = subtotal >= 50000 ? 0 : 3000; // Free shipping over ₩50,000
  const total = subtotal + shipping;

  // Loading state
  if (loading) {
    return (
      <>
        <ScrollHeader />
        <div className="min-h-screen bg-white">
          <main className="px-6 pt-[3em] pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your cart...</p>
              </div>
            </div>
          </main>
        </div>
        <Footer 
          companyName="Out of Place Object"
          founder="김종원, 조현흠"
          phone="02-0000-0000"
          businessNumber="000-0000-0000"
          address="성남시 분당구"
          email="contact@opo.kr"
        />
      </>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <>
        <ScrollHeader />
        <div className="min-h-screen bg-white">
          <main className="px-6 pt-[3em] pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-16">
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                <p className="text-gray-600 mb-8">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer 
          companyName="Out of Place Object"
          founder="김종원, 조현흠"
          phone="02-0000-0000"
          businessNumber="000-0000-0000"
          address="성남시 분당구"
          email="contact@opo.kr"
        />
      </>
    );
  }

  return (
    <>
      <ScrollHeader />
      <div className="min-h-screen bg-white">
        <main className="px-6 pt-[3em] pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                  Shopping Cart
                </h1>
                <p className="text-gray-600">
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
                </p>
              </div>
              
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/item/${item.slug}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full md:w-24 h-24 object-cover rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                          />
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <Link href={`/item/${item.slug}`}>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 mt-1">
                              ₩{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updating === item.id}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus size={16} />
                            </button>

                            <span className={`w-12 text-center font-medium ${updating === item.id ? 'opacity-50' : ''}`}>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus size={16} />
                            </button>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {item.quantity} × ₩{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                          </span>
                          <span className="font-semibold">
                            ₩{typeof item.price === 'number' ? (item.price * item.quantity).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₩{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₩${shipping.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    
                    {shipping === 0 && (
                      <p className="text-sm text-green-600">
                        🎉 You qualify for free shipping!
                      </p>
                    )}
                    
                    {shipping > 0 && (
                      <p className="text-sm text-gray-500">
                        Add ₩{(50000 - subtotal).toLocaleString()} more for free shipping
                      </p>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold">₩{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => alert('Checkout functionality will be implemented soon!')}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Continue Shopping */}
                  <Link 
                    href="/"
                    className="block w-full text-center border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <Footer 
        companyName="Out of Place Object"
        founder="김종원, 조현흠"
        phone="02-0000-0000"
        businessNumber="000-0000-0000"
        address="성남시 분당구"
        email="contact@opo.kr"
      />
    </>
  );
};

export default CartPage;