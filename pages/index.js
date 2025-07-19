import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ScrollHeader from '@/components/Header'
import Items from '@/components/Items'
import HeroSection from '@/components/HeroSection'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

const Homepage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroData, setHeroData] = useState({
    title: "Loading...", // Fallback title
    subtitle: "" // Fallback subtitle
  });

  // Extract unique categories from items
  const categories = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const uniqueCategories = [...new Set(
      items
        .map(item => item.category)
        .filter(category => category && category.trim() !== '')
    )];
    
    return uniqueCategories.sort();
  }, [items]);

  // Fetch hero section data for home page
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        console.log('Fetching hero data for home page...');
        
        const { data, error } = await supabase
          .from('hero_sections')
          .select('title, subtitle')
          .eq('page_name', 'home')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No hero data found for home page, using fallbacks');
          } else {
            throw error;
          }
        } else {
          console.log('Hero data fetched successfully:', data);
          setHeroData({
            title: data.title || "",
            subtitle: data.subtitle || ""
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Keep fallback values on error
      }
    };

    fetchHeroData();
  }, []);

  // Fetch all items from Supabase
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching items from Supabase...');
        
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false }); // Show newest items first

        if (error) {
          throw error;
        }

        console.log('Items fetched successfully:', data);

        // Transform Supabase data to match Items component format
        const transformedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image || '/images/placeholder.jpg', // fallback image
          hoverImage: item.hoverImage || item.image, // use hoverImage or fallback to main image
          description: item.description || 'No description available',
          price: item.price ? `${item.price}` : 'Contact for price',
          category: item.category,
          subcategory: item.subcategory
        }));

        setItems(transformedItems);
        setError(null);
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load products. Please try again later.');
        
        // Fallback to empty array or could use the original hardcoded data
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ScrollHeader/>

      <HeroSection 
        pageName="home"
        fallbackImage="/images/border.png"
        title={heroData.title}
        subtitle={heroData.subtitle}
      />

      {/* Category Navigation Section */}
      {!loading && !error && categories.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white text-center min-w-[10em] pt-[2em]">
                <h3 className="text-xl font-semibold text-black capitalize group-hover:text-gray-200 transition-colors">All Items</h3>
              </div>

              {categories.map((category) => {
                // Convert category name to URL-friendly slug
                const categorySlug = category.toLowerCase()
                
                return (
                  <Link 
                    key={category}
                    href={`/category/${categorySlug}`}
                    className="group"
                  >
                    <div className="bg-white text-center min-w-[10em] pt-[2em]">
                      <h3 className="text-xl font-semibold text-gray-300 capitalize group-hover:text-black transition-colors">
                        {category}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Items Section */}
      {loading ? (
        // Loading state
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-white text-xl">Loading products...</div>
          </div>
        </section>
      ) : error ? (
        // Error state
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-white underline hover:text-gray-300"
            >
              Try again
            </button>
          </div>
        </section>
      ) : items.length === 0 ? (
        // No items state
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-white text-xl">No products available at the moment.</div>
          </div>
        </section>
      ) : (
        // Display items from Supabase
        <>
          <Items 
            items={items}
            sectionId="products"
          />
        </>
      )}

      {/* Footer */}
      <Footer 
        companyName="Out of Place Object"
        founder="김종원, 조현흠"
        phone="02-0000-0000"
        businessNumber="000-0000-0000"
        address="성남시 분당구"
        email="contact@opo.kr"
      />
    </div>
  );
};

export default Homepage;