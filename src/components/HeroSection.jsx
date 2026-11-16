import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroBannerImg from '../assets/hero-banner.jpg';

export const HeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef(null);

  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById('catalog-section') || document.getElementById('category-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      // Swiped left
      setActiveSlide((prev) => (prev + 1) % 3);
    } else if (diff < -50) {
      // Swiped right
      setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1));
    }
    touchStartX.current = null;
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % 3);
  };

  return (
    <section 
      aria-label="Hero Showcase" 
      className="w-full bg-[#FAF2E9] overflow-hidden pt-0 sm:pt-4 lg:pt-6"
    >
      {/* 
        Hero Banner: Edge-to-edge on mobile, elegantly framed with subtle borders & rounded corners on desktop.
        Preserving the original composition, aspect ratio, photography, and decorative artwork.
      */}
      <div 
        className="w-full max-w-7xl mx-auto sm:px-4 lg:px-8 relative select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#FAF2E9] sm:rounded-2xl lg:rounded-3xl sm:border sm:border-[#E8D9C8] sm:shadow-card cursor-pointer group">
          
          <img 
            src={heroBannerImg}
            onError={(e) => {
              if (e.target.src !== window.location.origin + '/hero-banner.jpg') {
                e.target.src = '/hero-banner.jpg';
              }
            }}
            alt="House of Taaga — Rooted in love. Worn with grace. A mother-daughter label born from our shared love for Indian wear." 
            className="w-full h-full object-cover object-center block transition-transform duration-700 group-hover:scale-[1.01]"
            loading="eager"
            fetchpriority="high"
          />

          {/* 
            Accessible Clickable Overlay precisely aligned with the visible "Explore Collection ->" button
            in the hero banner image (Left: ~8.8%, Top: ~78.1%, Width: ~22.0%, Height: ~6.9%).
          */}
          <button
            onClick={handleScrollToCatalog}
            type="button"
            className="absolute left-[8.8%] top-[78.1%] w-[22.5%] h-[7.2%] rounded-md cursor-pointer opacity-0 focus:opacity-100 focus:outline-2 focus:outline-white focus:bg-white/20 transition-opacity z-10"
            aria-label="Explore House of Taaga Collection"
            title="Explore Collection"
          />

          {/* Desktop Hover Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#382017] items-center justify-center shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-90 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <button
            onClick={handleNext}
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#382017] items-center justify-center shadow-md backdrop-blur-xs opacity-0 group-hover:opacity-90 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Full Banner Click Area Fallback */}
          <div 
            onClick={handleScrollToCatalog}
            className="absolute inset-0 cursor-pointer -z-0"
            role="presentation"
          />
        </div>

        {/* 
          Three small circular carousel indicators below the banner
        */}
        <div className="flex items-center justify-center gap-2 py-3 sm:py-4 bg-[#FAF2E9]">
          {[0, 1, 2].map((idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'w-6 h-1.5 bg-[#B65A37] rounded-full shadow-xs' 
                    : 'w-1.5 h-1.5 bg-[#E8D9C8] hover:bg-[#B65A37]/50 rounded-full'
                }`}
                aria-label={`Go to banner slide ${idx + 1}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
