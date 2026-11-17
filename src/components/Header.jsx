import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  X, 
  User, 
  ShoppingBag, 
  Sparkles, 
  Phone, 
  FileText, 
  Heart,
  ChevronRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FloralOrnament, InstagramIcon } from './FloralDecorations';

export const LotusIcon = ({ className = "w-6 h-6", color = "#C69B52" }) => (
  <svg 
    viewBox="0 0 48 36" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path 
      d="M24 2C24 2 20 12 20 22C20 25.5 21.8 28 24 28C26.2 28 28 25.5 28 22C28 12 24 2 24 2Z" 
      stroke={color} 
      strokeWidth="1.8" 
      fill="#FAF2E9" 
    />
    <path 
      d="M21 9C21 9 14 17 15 25C15.5 28 18 29.5 21 28.5C19 25 19 19 21 9Z" 
      stroke={color} 
      strokeWidth="1.6" 
      fill="#FAF2E9" 
    />
    <path 
      d="M27 9C27 9 34 17 33 25C32.5 28 30 29.5 27 28.5C29 25 29 19 27 9Z" 
      stroke={color} 
      strokeWidth="1.6" 
      fill="#FAF2E9" 
    />
    <path 
      d="M16 19C16 19 8 23 8 28C8 31 12 32 17 30C15 27 15.5 23 16 19Z" 
      stroke={color} 
      strokeWidth="1.4" 
      fill="#FAF2E9" 
    />
    <path 
      d="M32 19C32 19 40 23 40 28C40 31 36 32 31 30C33 27 32.5 23 32 19Z" 
      stroke={color} 
      strokeWidth="1.4" 
      fill="#FAF2E9" 
    />
    <path 
      d="M14 33C19 35 29 35 34 33" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
    />
  </svg>
);

export const Header = () => {
  const navigate = useNavigate();
  const { 
    storeConfig, 
    categories,
    activeCategory,
    searchQuery, 
    setSearchQuery, 
    setActiveCategory, 
    setIsAdminOpen, 
    setIsContactOpen,
    setIsAboutOpen,
    wishlist,
    cartCount,
    cartSubtotal,
    setIsCartOpen
  } = useStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const phone = storeConfig?.whatsappNumber || '+91 93133 06258';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const handleCategoryNav = (slug) => {
    setActiveCategory(slug);
    setIsDrawerOpen(false);
    navigate('/');
    setTimeout(() => {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const scrollToSection = (id) => {
    setIsDrawerOpen(false);
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {/* ========================================================
          SECTION 1: ANNOUNCEMENT BAR
          Narrow terracotta bar at the very top.
          Centered text: "A little tradition, a lot of love"
          Ivory italic typography and small decorative floral ornaments on both sides.
          Desktop enhancement: Side boutique notes
         ======================================================== */}
      {storeConfig?.offers?.showAnnouncement !== false && (
        <aside aria-label="Announcement" className="w-full bg-[#B65A37] text-[#FFF9F2] py-2 px-4 relative z-50 select-none shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm">
            
            {/* Desktop Left Note */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-sans font-medium text-[#FFF9F2]/90 tracking-wide">
              <Truck className="w-3.5 h-3.5 text-[#E8D3AA]" />
              <span>Pan-India Express Delivery</span>
            </div>

            {/* Centered Main Announcement */}
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
              <FloralOrnament className="w-3.5 h-3.5 text-[#E8D3AA] shrink-0 opacity-90" />
              <span className="font-serif italic font-normal tracking-wider text-xs sm:text-sm text-center">
                {storeConfig?.offers?.announcementMessage || storeConfig?.announcement || 'A little tradition, a lot of love'}
              </span>
              <FloralOrnament className="w-3.5 h-3.5 text-[#E8D3AA] shrink-0 opacity-90" />
            </div>

            {/* Desktop Right Note */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-sans font-medium text-[#FFF9F2]/90 tracking-wide">
              <a 
                href={`https://wa.me/${cleanPhone}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#E8D3AA] transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-[#E8D3AA]" />
                <span>Studio: {phone}</span>
              </a>
            </div>

          </div>
        </aside>
      )}

      {/* ========================================================
          SECTION 2: HEADER (Sticky)
          Warm ivory background.
          Layout: Logo on LEFT, Search bar in MIDDLE, Actions on RIGHT.
          No sub-navigation options under the navbar.
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#E8D9C8] transition-all shadow-xs">
        
        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 -ml-1 text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-full transition-colors cursor-pointer lg:hidden"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
            </button>

            <div 
              onClick={() => {
                setActiveCategory('all');
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center cursor-pointer select-none group py-0.5"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/');
              }}
              aria-label="House of Taaga Home"
            >
              <img 
                src="/logo-transparent.png" 
                alt="House of Taaga" 
                className="h-8 sm:h-10 lg:h-12 w-auto max-w-[130px] sm:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Middle: Prominent Centered Search Bar */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-xl mx-1 sm:mx-4 lg:mx-8 flex items-center justify-center">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C6F5A] absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurtas, sarees, festive edit..."
                className="w-full pl-8 sm:pl-10 pr-8 py-1.5 sm:py-2.5 bg-[#FAF2E9] border border-[#E8D9C8] rounded-full text-xs sm:text-sm text-[#382017] placeholder:text-[#8C6F5A]/70 focus:outline-none focus:ring-1.5 focus:ring-[#B65A37] focus:bg-white focus:border-[#B65A37] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C6F5A] hover:text-[#382017] p-1 cursor-pointer"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            
            {/* Wishlist Link */}
            <button
              onClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 p-1.5 sm:p-2 text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-full transition-colors cursor-pointer text-xs font-sans"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D85179] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="font-medium hidden xl:inline">Wishlist</span>
            </button>

            {/* Account / Admin Portal */}
            <button
              onClick={() => navigate('/admin')}
              className="p-1.5 sm:p-2 text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-full transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-sans"
              aria-label="Account / Admin Portal"
              title="Admin & Account"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
              <span className="font-medium hidden xl:inline">Account</span>
            </button>

            {/* Shopping Bag Icon with Quantity Badge & Subtotal Preview */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 lg:px-3 lg:py-1.5 text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-full transition-all cursor-pointer touch-manipulation flex items-center gap-2"
              aria-label="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#B65A37] text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-xs select-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-sans font-medium text-[#382017]">
                Bag {cartCount > 0 && `(₹${cartSubtotal.toLocaleString('en-IN')})`}
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Dropdown Live Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-[#E8D9C8] bg-[#FFF9F2] px-4 py-3 shadow-inner animate-in fade-in slide-in-from-top-1 duration-200 lg:hidden">
            <div className="max-w-md mx-auto relative flex items-center">
              <Search className="w-4 h-4 text-[#8C6F5A] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search kurtas, sarees, co-ord sets..."
                autoFocus
                className="w-full pl-9 pr-9 py-2 bg-white border border-[#E8D9C8] rounded-full text-xs text-[#382017] placeholder:text-[#8C6F5A]/70 focus:outline-none focus:ring-1 focus:ring-[#B65A37] focus:border-[#B65A37]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#8C6F5A] hover:text-[#382017]"
                  aria-label="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER
         ======================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-[#382017]/50 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="absolute inset-y-0 left-0 max-w-[320px] w-full bg-[#FFF9F2] shadow-2xl flex flex-col justify-between border-r border-[#E8D9C8]">
            
            {/* Drawer Top Header */}
            <div>
              <div className="p-4 border-b border-[#E8D9C8] flex items-center justify-between bg-[#FAF2E9]">
                <img 
                  src="/logo-transparent.png" 
                  alt="House of Taaga" 
                  className="h-8 w-auto object-contain"
                />
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-[#382017] hover:text-[#B65A37] rounded-full hover:bg-white/60 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Collections Navigation Links */}
              <div className="py-3 px-4">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B65A37] block mb-2 px-2">
                  Shop Collections
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleCategoryNav('all')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-serif text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-xl transition-colors text-left"
                  >
                    <span>All Collections</span>
                    <ChevronRight className="w-4 h-4 text-[#C69B52]" />
                  </button>

                  {Array.isArray(categories) && categories.map((cat) => (
                    <button
                      key={cat.id || cat.slug}
                      onClick={() => handleCategoryNav(cat.slug)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-serif text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-xl transition-colors text-left"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-[#C69B52]" />
                    </button>
                  ))}
                </nav>

                <div className="my-3 border-t border-[#E8D9C8]" />

                {/* Brand Story & Support Links */}
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#B65A37] block mb-2 px-2">
                  About & Studio
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsAboutOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-xl transition-colors text-left"
                  >
                    <Sparkles className="w-4 h-4 text-[#C69B52]" />
                    <span>Our Story (Mother & Daughter)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsContactOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-xl transition-colors text-left"
                  >
                    <Phone className="w-4 h-4 text-[#B65A37]" />
                    <span>WhatsApp Concierge</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate('/order');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#382017] hover:text-[#B65A37] hover:bg-[#FAF2E9] rounded-xl transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-[#8C6F5A]" />
                    <span>Track Your Order</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Drawer Bottom Details */}
            <div className="p-4 border-t border-[#E8D9C8] bg-[#FAF2E9] space-y-2 text-center">
              <p className="text-[11px] font-serif italic text-[#382017]">
                "Rooted in love. Worn with grace."
              </p>
              <div className="flex items-center justify-center gap-4 pt-1">
                <a 
                  href="https://instagram.com/house_of_taaga" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#8C6F5A] hover:text-[#B65A37] transition-colors p-1"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a 
                  href={`https://wa.me/${cleanPhone}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#8C6F5A] hover:text-[#B65A37] transition-colors p-1"
                  aria-label="WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
              <p className="text-[9.5px] text-[#8C6F5A] tracking-wider uppercase">
                Pune, Maharashtra, India
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
