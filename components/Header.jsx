import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import SandwichMenu from './SandwichMenu';
import CartIcon from './CartIcon';

export default function ScrollHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/images/logo.png'); // Default fallback
  const [logoLoading, setLogoLoading] = useState(true);

  // Fetch logo from Supabase
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_sections')
          .select('image_url')
          .eq('page_name', 'logo')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
        // If no data found, keep the default fallback
      } catch (error) {
        console.error('Error fetching logo:', error);
        // Keep default fallback on error
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50); // Show header after scrolling 50px
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Updated header with perfectly centered logo */}
      <nav className={`fixed top-0 left-0 right-0 z-50 mx-auto px-[2em] transition-all duration-300 ease-in-out
        // isScrolled 
        //   ? 'translate-y-0 opacity-100 bg-white backdrop-blur-md shadow-lg' 
        //   : '-translate-y-full opacity-0'
      `}>
        <div className="max-w-[1000px] mx-auto px-6 py-6">
          <div className="relative flex items-center">
            {/* Centered Logo - positioned absolutely to ignore flex layout */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <a href="/">
                {logoLoading ? (
                  // Loading placeholder
                  <div className="w-[5em] h-[2.5em] bg-gray-200 animate-pulse rounded" />
                ) : (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="w-[5em]"
                    onError={(e) => {
                      // If uploaded logo fails, fall back to default
                      e.target.src = '/images/logo.png';
                    }}
                  />
                )}
              </a>
            </div>
            
            {/* Cart Icon - positioned on the right */}  
            {/* <CartIcon/> */}

            {/* Sandwich Menu - positioned on the right */}
            <div className="ml-auto">
              <SandwichMenu/>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}