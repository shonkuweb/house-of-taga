import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BougainvilleaSprig, TornPaperEdge } from './FloralDecorations';

export const OurStorySection = () => {
  const { setIsAboutOpen } = useStore();

  return (
    <section 
      id="our-story-section"
      aria-label="Our Story" 
      className="relative w-full bg-[#F8F1E7] overflow-hidden my-6 sm:my-10"
    >
      {/* Soft torn-paper edge at the top */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <TornPaperEdge className="h-3 sm:h-5 w-full text-[#FAF2E9]" />
      </div>

      {/* Bougainvillea Flower Sprigs in Corners */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 pointer-events-none">
        <BougainvilleaSprig className="w-24 h-24 sm:w-36 sm:h-36 opacity-90" />
      </div>
      <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10 pointer-events-none">
        <BougainvilleaSprig className="w-24 h-24 sm:w-36 sm:h-36 opacity-90" mirrored />
      </div>

      {/* Main Story Container */}
      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-6 py-14 sm:py-20 relative z-20">
        <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
          
          {/* 
            Mother-Daughter Photo in slightly rotated editorial photo frame 
            with cream border and subtle shadow
          */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative group max-w-xs sm:max-w-sm w-full">
              {/* Subtle gold accent frame behind */}
              <div className="absolute inset-0 bg-[#E8D3AA]/50 rounded-sm transform rotate-1 scale-102 transition-transform duration-500 group-hover:rotate-0" />

              {/* Editorial Frame with Founders Photo */}
              <div className="relative bg-white p-3 sm:p-4 rounded-sm shadow-editorial transform -rotate-2 group-hover:rotate-0 transition-transform duration-500 border border-[#E8D9C8]">
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#FAF2E9] rounded-xs">
                  <img
                    src="/founders.jpg"
                    alt="House of Taaga Founders — Mother and Daughter"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
                    loading="lazy"
                  />
                </div>
                {/* Handwritten/Editorial Caption underneath */}
                <div className="pt-3 pb-1 text-center border-t border-[#F0E4D5] mt-2.5">
                  <p className="font-serif italic text-xs sm:text-sm text-[#7D5E43] tracking-wide">
                    Neeta & Riddhi — Founders, House of Taaga
                  </p>
                  <p className="text-[9px] font-sans font-medium uppercase tracking-[0.2em] text-[#B65A37] mt-0.5">
                    Pune Studio • Since 2022
                  </p>
                </div>
              </div>

              {/* Decorative Stamp or Tape effect in top-right */}
              <div className="absolute -top-3 -right-2 bg-[#FFF9F2]/90 border border-[#C69B52]/50 px-2.5 py-0.5 text-[9px] font-serif uppercase tracking-wider text-[#A7472B] shadow-xs rotate-6">
                Rooted in Love
              </div>
            </div>
          </div>

          {/* Story Narrative & Call to Action */}
          <div className="w-full md:w-1/2 text-center md:text-left space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF2E9] border border-[#E8D9C8] text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B65A37]">
              <Sparkles className="w-3 h-3 text-[#C69B52]" />
              <span>The Mother & Daughter Label</span>
            </div>

            {/* Heading matching prompt exactly */}
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#382017] font-normal leading-tight tracking-tight">
              Two generations.<br />
              <span className="italic text-[#A7472B]">One shared love.</span>
            </h2>

            {/* Description matching prompt exactly */}
            <p className="font-sans text-sm sm:text-base text-[#5A382A] font-light leading-relaxed">
              "Hi, we’re House of Taaga! A mother-daughter label born from our shared love for Indian wear, thoughtful details, and the joy of building something side by side."
            </p>

            <p className="font-sans text-xs sm:text-sm text-[#7D5E43] font-light leading-relaxed hidden sm:block">
              Every piece in our collection is curated in Pune with reverence for slow fashion, natural textiles, and the cherished rituals of Indian dressing.
            </p>

            {/* Terracotta CTA Button matching prompt */}
            <div className="pt-2">
              <button
                onClick={() => setIsAboutOpen(true)}
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 bg-[#B65A37] hover:bg-[#A7472B] text-[#FFF9F2] rounded-full text-xs font-sans font-semibold uppercase tracking-wider shadow-soft hover:shadow-editorial transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Discover Our Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Soft torn-paper edge at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <TornPaperEdge flip className="h-3 sm:h-5 w-full text-[#FAF2E9]" />
      </div>
    </section>
  );
};
