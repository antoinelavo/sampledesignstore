import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SandwichMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Fetch unique categories from Supabase
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('items')
        .select('category')
        .not('category', 'is', null) // Exclude null categories
        .neq('category', ''); // Exclude empty categories

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      // Get unique categories and remove duplicates (case-insensitive)
      const uniqueCategories = [...new Set(
        data
          .map(item => item.category?.trim()) // Remove whitespace
          .filter(Boolean) // Remove falsy values
          .map(category => category.toLowerCase()) // Convert to lowercase for comparison
      )];

      // Convert back to original case for display, using the first occurrence
      const displayCategories = uniqueCategories.map(lowerCategory => {
        const originalCase = data.find(item => 
          item.category?.toLowerCase().trim() === lowerCategory
        )?.category?.trim();
        
        return {
          display: originalCase || lowerCategory,
          slug: lowerCategory
        };
      });

      setCategories(displayCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={toggleMenu}
        className="relative flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer"
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-black mb-1 transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-black mb-1 transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : ''
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-black transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        ></span>
      </button>

      {/* Full Viewport Dark Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-black/50 z-[9998]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={toggleMenu}
        ></div>
      )}

      {/* Sidebar Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-white/80 shadow-xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ position: 'fixed' }}
      >
        <div className="flex flex-col justify-center items-center h-full space-y-8 px-6">
          {/* Home Link */}
          <a
            href="/"
            className="text-3xl font-medium text-gray-800 hover:text-rose-400 transition-colors duration-200"
            onClick={toggleMenu}
          >
            홈
          </a>

          {/* Loading State */}
          {loading && (
            <div className="text-lg text-gray-500">
              카테고리 로딩중...
            </div>
          )}

          {/* Dynamic Category Links */}
          {!loading && categories.length > 0 && categories.map((category) => (
            <a
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-3xl font-medium text-gray-800 hover:text-rose-400 transition-colors duration-200 text-center"
              onClick={toggleMenu}
            >
              {category.display}
            </a>
          ))}

          {/* No Categories Found */}
          {!loading && categories.length === 0 && (
            <div className="text-lg text-gray-500 text-center">
              카테고리가 없습니다
            </div>
          )}

        </div>
      </div>
    </>
  );
}