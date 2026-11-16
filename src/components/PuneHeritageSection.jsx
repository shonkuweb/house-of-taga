import React from 'react';

export const PuneHeritageSection = () => {
  return (
    <section 
      aria-label="Pune Heritage Artwork"
      className="w-full bg-[#FAF2E9] overflow-hidden pt-8 pb-4 relative select-none"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
        
        {/* Responsive Shaniwar Wada Pune Heritage Artwork */}
        <div className="w-full relative rounded-2xl overflow-hidden bg-[#FAF2E9] border border-[#E8D9C8]/60 shadow-xs">
          <img 
            src="/pune-heritage.svg"
            onError={(e) => {
              if (e.target.src !== window.location.origin + '/pune-heritage.png') {
                e.target.src = '/pune-heritage.png';
              }
            }}
            alt="Hand-drawn architectural line art of Shaniwar Wada in Pune, with surrounding hills, foliage and bougainvillea. Proudly rooted in Pune."
            className="w-full h-auto object-contain block transition-transform duration-700 hover:scale-[1.01]"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  );
};
