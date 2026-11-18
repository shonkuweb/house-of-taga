import React from 'react';
import { Truck, ShieldCheck, MessageCircleHeart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const TrustFeaturesSection = () => {
  const { setIsContactOpen } = useStore();

  const features = [
    {
      id: 'shipping',
      icon: Truck,
      title: 'Pan-India Shipping',
      subtitle: 'Express delivery to every pin code',
      onClick: null,
    },
    {
      id: 'payments',
      icon: ShieldCheck,
      title: 'Secure Payments',
      subtitle: '100% encrypted UPI & cards',
      onClick: null,
    },
    {
      id: 'support',
      icon: MessageCircleHeart,
      title: 'Friendly Support',
      subtitle: 'Direct WhatsApp concierge',
      onClick: () => {
        const phone = storeConfig?.whatsappNumber || '+91 93133 06258';
        const clean = phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${clean}?text=${encodeURIComponent('Hello House of Taaga, I need assistance with my order / styling.')}`, '_blank');
      },
    },
  ];

  return (
    <section 
      aria-label="House of Taaga Services"
      className="border-y border-[#E8D9C8] bg-[#FFF9F2] py-5 sm:py-6"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-2 sm:px-4">
        
        {/* Minimalist 3-column row separated with subtle vertical dividers */}
        <div className="grid grid-cols-3 divide-x divide-[#E8D9C8]">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={feat.onClick || undefined}
                className={`flex flex-col items-center text-center px-1.5 sm:px-4 group ${
                  feat.onClick ? 'cursor-pointer' : ''
                }`}
              >
                {/* Thin, premium line icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FAF2E9] flex items-center justify-center text-[#B65A37] group-hover:scale-110 transition-transform duration-300 mb-1.5 sm:mb-2 shadow-2xs">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.4]" />
                </div>

                <h4 className="font-serif text-xs sm:text-sm font-medium text-[#382017] tracking-tight leading-snug">
                  {feat.title}
                </h4>

                <p className="text-[9.5px] sm:text-[11px] font-sans font-light text-[#8C6F5A] mt-0.5 line-clamp-1">
                  {feat.subtitle}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
