import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';

// Intricate Golden Lotus Emblem
const LotusEmblem = ({ className = "w-5 h-5 text-[#C4924D]" }) => (
  <svg 
    viewBox="0 0 48 36" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path 
      d="M24 2C24 2 20 12 20 22C20 25.5 21.8 28 24 28C26.2 28 28 25.5 28 22C28 12 24 2 24 2Z" 
      stroke="currentColor" 
      strokeWidth="1.6" 
      fill="#FFF9F2" 
    />
    <path 
      d="M21 9C21 9 14 17 15 25C15.5 28 18 29.5 21 28.5C19 25 19 19 21 9Z" 
      stroke="currentColor" 
      strokeWidth="1.4" 
      fill="#FFF9F2" 
    />
    <path 
      d="M27 9C27 9 34 17 33 25C32.5 28 30 29.5 27 28.5C29 25 29 19 27 9Z" 
      stroke="currentColor" 
      strokeWidth="1.4" 
      fill="#FFF9F2" 
    />
    <path 
      d="M16 19C16 19 8 23 8 28C8 31 12 32 17 30C15 27 15.5 23 16 19Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      fill="#FFF9F2" 
    />
    <path 
      d="M32 19C32 19 40 23 40 28C40 31 36 32 31 30C33 27 32.5 23 32 19Z" 
      stroke="currentColor" 
      strokeWidth="1.3" 
      fill="#FFF9F2" 
    />
    <path 
      d="M14 33C19 35 29 35 34 33" 
      stroke="currentColor" 
      strokeWidth="1.4" 
      strokeLinecap="round" 
    />
  </svg>
);

export const OurStorySection = () => {

  return (
    <section 
      id="our-story-section"
      aria-label="Our Story" 
      className="relative w-full bg-[#FAF4ED] overflow-hidden pt-8 sm:pt-14 pb-10 sm:pb-16 select-none border-b border-[#DEC49E]/40"
    >
      
      {/* Background Soft Grain & Texture Accent */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        {/* ========================================================
            FOUNDERS POLAROID ARTWORK (MATCHING IMAGE 2 EXACTLY)
            - Gold Arched Wireframe behind
            - Tilted Royal Wine Brocade Card
            - Founders Polaroid with caption:
              "Maa & Me — Two Generations, One Love for Indian Wear"
              "— PURE STUDIO • SINCE 2023 —"
            - Pinned Gold "OUR STORY" Lotus Ticket
            - Pink Botanical Blossom Sprigs on Left & Right
           ======================================================== */}
        <div className="relative w-full max-w-[360px] sm:max-w-[440px] md:max-w-[480px] mx-auto mb-4 sm:mb-6">
          <img 
            src="/our-story-founders-card.png" 
            alt="Maa & Me — Neeta & Riddhi, House of Taaga Founders" 
            className="w-full h-auto object-contain mx-auto filter drop-shadow-md hover:scale-[1.01] transition-transform duration-500" 
          />
        </div>

        {/* ========================================================
            THE MOTHER & DAUGHTER LABEL PILL BADGE
           ======================================================== */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF3EA] border border-[#C4924D]/70 shadow-2xs mb-3.5">
          <Users className="w-3.5 h-3.5 text-[#8C2436]" />
          <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.22em] text-[#8C2436]">
            THE MOTHER & DAUGHTER LABEL
          </span>
        </div>

        {/* ========================================================
            TWO GENERATIONS, ONE SHARED LOVE HEADLINE
           ======================================================== */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#270803] font-medium leading-tight">
          Two Generations,
          <span className="block font-serif italic text-3xl sm:text-4xl lg:text-[44px] text-[#6B0D23] font-normal leading-tight mt-0.5">
            One Shared Love.
          </span>
        </h2>

        {/* ========================================================
            CENTERED GOLD LOTUS EMBLEM DIVIDER
           ======================================================== */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 my-3 sm:my-3.5">
          <span className="h-px w-8 sm:w-16 bg-[#DEC49E]" />
          <LotusEmblem className="w-4 h-4 sm:w-5 sm:h-5 text-[#C4924D]" />
          <span className="h-px w-8 sm:w-16 bg-[#DEC49E]" />
        </div>

        {/* ========================================================
            STORY NARRATIVE PARAGRAPH
           ======================================================== */}
        <p className="font-serif text-sm sm:text-base text-[#4A3B32] leading-relaxed max-w-lg mx-auto px-4">
          Hi, we’re House of Taaga, a mother–daughter label born from our shared love for Indian wear, thoughtful details, and the joy of building something side by side.
        </p>

        {/* ========================================================
            DISCOVER OUR STORY CTA BUTTON
           ======================================================== */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('pune-heritage-section') || document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#5C061C] via-[#730D26] to-[#5C061C] hover:from-[#450313] hover:to-[#450313] text-[#FFF9F2] rounded-full text-xs font-sans font-bold uppercase tracking-[0.18em] shadow-lg shadow-[#5C061C]/25 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>DISCOVER OUR STORY</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

      </div>

    </section>
  );
};
