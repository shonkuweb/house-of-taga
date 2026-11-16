import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Check, 
  Sparkles,
  Heart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FloralOrnament, InstagramIcon } from './FloralDecorations';

export const Footer = () => {
  const navigate = useNavigate();
  const { 
    storeConfig, 
    setActiveCategory, 
    setIsContactOpen, 
    setIsAboutOpen, 
    showToast 
  } = useStore();

  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const phone = storeConfig?.whatsappNumber || '+91 93133 06258';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const email = storeConfig?.supportEmail || 'care@houseoftaaga.com';

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    setIsSubscribed(true);
    showToast('Welcome to the House of Taaga family ♡');
    setEmailInput('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  const handleCategoryClick = (slug) => {
    setActiveCategory(slug);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      aria-label="House of Taaga Footer"
      className="bg-[#FFF9F2] text-[#382017] border-t border-[#E8D9C8] pt-12 pb-24 sm:pb-12"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E8D9C8]">
          
          {/* Col 1: Brand Info & Story (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div 
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block cursor-pointer"
            >
              <img 
                src="/logo-transparent.png" 
                alt="House of Taaga" 
                className="h-10 w-auto object-contain"
              />
            </div>

            <p className="font-serif italic text-sm text-[#7D5E43] leading-relaxed max-w-sm">
              "A mother-daughter label born from our shared love for Indian wear, thoughtful details, and the joy of building something side by side."
            </p>

            <div className="space-y-2 pt-1 text-xs text-[#5A382A] font-sans">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#B65A37] shrink-0" />
                <span>Pune Studio • Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B65A37] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-[#B65A37] transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B65A37] shrink-0" />
                <a 
                  href={`https://wa.me/${cleanPhone}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#B65A37] transition-colors"
                >
                  {phone} (WhatsApp Concierge)
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com/house_of_taaga" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-[#FAF2E9] hover:bg-[#B65A37] text-[#382017] hover:text-white flex items-center justify-center transition-all shadow-2xs"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href={`https://wa.me/${cleanPhone}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-[#FAF2E9] hover:bg-[#B65A37] text-[#382017] hover:text-white flex items-center justify-center transition-all shadow-2xs"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop Collections (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.18em] text-[#B65A37]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-serif">
              <li>
                <button onClick={() => handleCategoryClick('all')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  All Pieces
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('kurtas')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Kurtas
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('sarees')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Sarees
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('coord-sets')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Co-ord Sets
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick('festive-edit')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Festive Edit
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: About & Care (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.18em] text-[#B65A37]">
              About & Care
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button onClick={() => setIsAboutOpen(true)} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Our Story
                </button>
              </li>
              <li>
                <button onClick={() => setIsContactOpen(true)} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Contact Studio
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/order')} className="hover:text-[#B65A37] transition-colors cursor-pointer">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="hover:text-[#B65A37] transition-colors cursor-pointer text-[#8C6F5A]">
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Signup (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-[0.18em] text-[#B65A37]">
              The Taaga Letter
            </h4>
            <p className="text-xs text-[#7D5E43] font-sans font-light leading-relaxed">
              Receive gentle notes on new heirloom drops, textile stories, and private studio previews.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 pt-1">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8D9C8] rounded-full text-[#382017] placeholder:text-[#8C6F5A]/70 focus:outline-none focus:ring-1 focus:ring-[#B65A37]"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-full text-[10px] font-sans font-semibold tracking-wider uppercase transition-colors"
                  aria-label="Subscribe"
                >
                  {isSubscribed ? <Check className="w-3.5 h-3.5" /> : 'Join'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C6F5A] font-sans">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© 2026 House of Taaga. Handcrafted with love in Pune</span>
            <FloralOrnament className="w-3 h-3 text-[#B65A37] inline-block" />
          </div>

          <div className="flex items-center gap-4 text-[10.5px]">
            <button 
              onClick={() => showToast('House of Taaga respects your privacy. Your data is encrypted.')}
              className="hover:text-[#B65A37] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => showToast('Terms of service available upon request via concierge.')}
              className="hover:text-[#B65A37] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button 
              onClick={() => showToast('Pan-India delivery in 3-5 business days.')}
              className="hover:text-[#B65A37] transition-colors cursor-pointer"
            >
              Shipping Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
