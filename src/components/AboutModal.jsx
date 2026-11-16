import React from 'react';
import { X, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BougainvilleaSprig, FloralOrnament } from './FloralDecorations';

export const AboutModal = () => {
  const { isAboutOpen, setIsAboutOpen, setActiveCategory } = useStore();

  if (!isAboutOpen) return null;

  const handleShopNow = () => {
    setIsAboutOpen(false);
    setActiveCategory('all');
    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#382017]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-lg bg-[#FAF2E9] rounded-3xl border border-[#E8D9C8] shadow-2xl overflow-hidden my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAboutOpen(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#382017] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          aria-label="Close story modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Decorative Corner Flowers */}
        <div className="absolute top-0 left-0 pointer-events-none">
          <BougainvilleaSprig className="w-20 h-20 opacity-80" />
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Founders Photo in frame */}
          <div className="max-w-[240px] mx-auto bg-white p-2.5 rounded-sm shadow-md border border-[#E8D9C8] transform -rotate-1">
            <div className="aspect-[4/5] overflow-hidden rounded-xs bg-[#FAF2E9]">
              <img 
                src="/founders.jpg" 
                alt="House of Taaga Founders" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <p className="text-center font-serif italic text-xs text-[#7D5E43] pt-2">
              Neeta & Riddhi — Pune Studio
            </p>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B65A37]">
              <Sparkles className="w-3 h-3 text-[#C69B52]" />
              <span>Two Generations • One Shared Love</span>
            </div>

            <h3 id="about-modal-title" className="font-serif text-2xl text-[#382017] font-normal leading-tight">
              The Story of <span className="italic text-[#A7472B]">House of Taaga</span>
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs sm:text-sm text-[#5A382A] font-light leading-relaxed">
            <p>
              "Hi, we’re House of Taaga! A mother-daughter label born from our shared love for Indian wear, thoughtful details, and the joy of building something side by side."
            </p>
            <p>
              Based out of Pune, Maharashtra, we began around our family dining table—talking about how hard it was to find Indian wear that honored age-old textile heritage without feeling heavy, rigid, or hurried.
            </p>
            <p>
              Every garment in our collections is made in small, mindful batches using natural handlooms, hand-done Bandhani resists, delicate gota patti, and soft mulmuls that soften with every wear.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleShopNow}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-full text-xs font-sans font-semibold uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsAboutOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-transparent hover:bg-white/60 text-[#382017] border border-[#E8D9C8] rounded-full text-xs font-sans font-medium uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
