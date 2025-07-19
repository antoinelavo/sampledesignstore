import React, { useState, useMemo, useEffect } from 'react';
import ScrollHeader from '@/components/Header'
import Items from '@/components/Items'
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

const CategoryPage = ({ items, category, error }) => {
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [heroData, setHeroData] = useState({
    title: null,
    subtitle: null
  });

  // Extract unique subcategories from items
  const subcategories = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const uniqueSubcategories = [...new Set(
      items
        .map(item => item.subcategory)
        .filter(subcategory => subcategory && subcategory.trim() !== '')
    )];
    
    return uniqueSubcategories.sort();
  }, [items]);

  // Filter items based on active subcategory
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (activeSubcategory === 'all') return items;
    
    return items.filter(item => item.subcategory === activeSubcategory);
  }, [items, activeSubcategory]);

  // Generate dynamic page name for hero image
  const heroPageName = useMemo(() => {
    if (activeSubcategory === 'all') {
      return category; // Use category name for "all" view
    } else {
      // Use format: "category-subcategory" (e.g., "kennel-club-dog", "clothing-shirts")
      return `${category}-${activeSubcategory.toLowerCase().replace(/\s+/g, '-')}`;
    }
  }, [category, activeSubcategory]);

  // Fetch hero section data when heroPageName changes
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        console.log(`Fetching hero data for page: ${heroPageName}`);
        
        const { data, error } = await supabase
          .from('hero_sections')
          .select('title, subtitle')
          .eq('page_name', heroPageName)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`No hero data found for ${heroPageName}, using fallbacks`);
            // Set fallback based on current context
            const fallbackTitle = activeSubcategory === 'all' 
              ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
              : `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} - ${activeSubcategory}`;
            
            setHeroData({
              title: fallbackTitle,
              subtitle: null
            });
          } else {
            throw error;
          }
        } else {
          console.log(`Hero data fetched successfully for ${heroPageName}:`, data);
          setHeroData({
            title: data.title,
            subtitle: data.subtitle
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Keep fallback values on error
        const fallbackTitle = activeSubcategory === 'all' 
          ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
          : `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} - ${activeSubcategory}`;
        
        setHeroData({
          title: fallbackTitle,
          subtitle: null
        });
      }
    };

    if (heroPageName) {
      fetchHeroData();
    }
  }, [heroPageName, category, activeSubcategory]);

  // Handle error case
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Error Loading Category</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Handle empty category case
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen">
        <ScrollHeader/>
        
        {/* Hero Section */}
        <HeroSection 
          pageName={category}
          title={heroData.title || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          subtitle={heroData.subtitle}
          fallbackImage="/images/background1.jpeg"
          showOverlay={true}
        />

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
  }

  return (
    <div className="min-h-screen">
      <ScrollHeader/>

      {/* Dynamic Hero Section - Changes based on selected subcategory */}
      <HeroSection 
        pageName={heroPageName}
        title={heroData.title}
        subtitle={heroData.subtitle}
        fallbackImage="/images/background1.jpeg"
      />

      {/* Hero Section Text */}
      <section className="relative flex items-center justify-center bg-white">        
        <div className="relative z-10 text-center text-black bg-white pt-[3em] pb-[1em]">
          <h1 className="text-3xl font-bold capitalize tracking-wide">
            {activeSubcategory === 'all' ? category : `${category}`}
          </h1>
        </div>
      </section>

      {/* Subcategory Filter Buttons */}
      {subcategories.length > 0 && (
        <section>
          <div className="bg-white mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white max-w-7xl flex flex-wrap justify-center gap-4 mx-auto">
              {/* Show All button */}
              <button
                onClick={() => setActiveSubcategory('all')}
                className={`px-6 text-sm font-medium transition-colors duration-200 ${
                  activeSubcategory === 'all'
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                All Items
              </button>
              
              {/* Subcategory buttons */}
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => setActiveSubcategory(subcategory)}
                  className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeSubcategory === subcategory
                      ? 'text-black'
                      : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Items Section */}
      <Items 
        items={filteredItems}
        sectionId={`${category}-items`}
      />

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

// This function runs on each request (server-side)
export async function getServerSideProps({ params }) {
  const { slug } = params;
  
  console.log('Slug from URL:', slug); // Debug log
  
  try {
    // First, let's fetch ALL items to see what's in the database
    const { data: allData, error: allError } = await supabase
      .from('items')
      .select('*');
    
    console.log('All items in database:', allData); // Debug log
    
    if (allData) {
      console.log('Available categories:', [...new Set(allData.map(item => item.category))]); // Debug log
    }

    // Now fetch items for this specific category with multiple matching strategies
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .or(`category.ilike.${slug},category.ilike.${slug.toLowerCase()},category.ilike.${slug.toUpperCase()},category.ilike.${slug.charAt(0).toUpperCase() + slug.slice(1)}`)
      .order('name');

    console.log('Filtered data for slug:', slug, data); // Debug log

    if (error) {
      console.error('Supabase error:', error);
      return {
        props: {
          items: [],
          category: slug,
          error: `Failed to load ${slug} items: ${error.message}`
        }
      };
    }

    // If no items found with the above query, try a simpler approach
    let finalData = data;
    if (!data || data.length === 0) {
      console.log('No items found with complex query, trying simple match...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('items')
        .select('*')
        .eq('category', slug);
      
      console.log('Simple query result:', simpleData);
      finalData = simpleData;
    }

    // Transform data to match your Items component expected format
    const transformedItems = finalData?.map(item => {
      console.log('Processing item:', item); // Debug each item
      return {
        name: item.name || 'Unnamed Item',
        image: item.image || `/images/${slug}/default.jpeg`,
        hoverImage: item.hoverImage || (item.image ? item.image.replace('front', 'main') : null),
        description: item.description || 'No description available',
        price: item.price || 'Price not available',
        category: item.category || slug,
        subcategory: item.subcategory || null // Make sure to include subcategory
      };
    }) || [];

    console.log('Transformed items:', transformedItems); // Debug transformed data

    // Don't filter out items - let's see everything first
    return {
      props: {
        items: transformedItems,
        category: slug,
        error: null
      }
    };

  } catch (err) {
    console.error('Error fetching category data:', err);
    return {
      props: {
        items: [],
        category: slug,
        error: `Failed to load ${slug} items. Please try again later.`
      }
    };
  }
}

export default CategoryPage;