import React from 'react';
import { useStore } from '../context/StoreContext';
import { FloralDivider, MughalArchCard } from './FloralDecorations';

export const ShopByCategory = ({ onSelectCategory }) => {
  const { categories, activeCategory, setActiveCategory } = useStore();

  const handleCategoryClick = (slug) => {
    setActiveCategory(slug);
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fallback category items matching the exact 4 required in the prompt
  const displayCategories = [
    {
      id: 'cat_kurtas',
      name: 'Kurtas',
      slug: 'kurtas',
      subtitle: 'Artisanal Everyday Silhouettes',
      imageUrl: '/category-kurtas.jpg',
    },
    {
      id: 'cat_sarees',
      name: 'Sarees',
      slug: 'sarees',
      subtitle: 'Handwoven Chanderi & Silks',
      imageUrl: '/category-sarees.jpg',
    },
    {
      id: 'cat_coord',
      name: 'Co-ord Sets',
      slug: 'coord-sets',
      subtitle: 'Modern Ease & Linen Cuts',
      imageUrl: '/category-coord.jpg',
    },
    {
      id: 'cat_festive',
      name: 'Festive Edit',
      slug: 'festive-edit',
      subtitle: 'Opulent Zari & Kashmiri Yokes',
      imageUrl: '/category-festive.jpg',
    },
  ];

  return (
    <section 
      id="category-section" 
      aria-label="Shop by Category"
      className="py-10 sm:py-14 bg-[#FAF2E9] transition-all"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
        
        {/* Section Heading with terracotta hairlines and floral ornaments */}
        <FloralDivider 
          title="Shop by Category" 
          subtitle="TIMELESS SILHOUETTES • THOUGHTFUL DETAILS"
        />

        {/* 
          Four Image Category Cards:
          - Custom Mughal/Maharashtrian-inspired arch-shaped image frames
          - Thin terracotta borders
          - Warm cream background
          - Elegant serif category labels
          - Responsive grid (2 cols on mobile, 4 cols on tablet/desktop)
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {displayCategories.map((cat) => {
            const isSelected = activeCategory === cat.slug;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className="group flex flex-col items-center cursor-pointer select-none"
              >
                {/* Cusped Mughal Arch Frame */}
                <div 
                  className={`w-full aspect-[3/4] relative overflow-hidden bg-[#FFF9F2] rounded-t-[44px] rounded-b-2xl border transition-all duration-500 shadow-xs group-hover:shadow-editorial group-hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-[#B65A37] ring-2 ring-[#B65A37]/30 ring-offset-2' 
                      : 'border-[#B65A37]/30 group-hover:border-[#B65A37]'
                  }`}
                >
                  {/* Category Image */}
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Soft Warm Gradient at bottom for text readability if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#382017]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Inner Arch Dotted Filigree */}
                  <div className="absolute inset-1 rounded-t-[40px] rounded-b-xl border border-dashed border-[#C69B52]/40 pointer-events-none" />

                  {/* Subtle "EXPLORE" pill on hover */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="px-3 py-1 bg-[#FFF9F2]/90 backdrop-blur-xs text-[#B65A37] text-[10px] font-sans font-bold uppercase tracking-wider rounded-full shadow-xs">
                      Explore
                    </span>
                  </div>
                </div>

                {/* Category Label */}
                <div className="mt-2.5 text-center">
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#382017] group-hover:text-[#B65A37] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-sans text-[#8C6F5A] font-light mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
