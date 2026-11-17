import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FloralDivider } from './FloralDecorations';

export const ProductCatalog = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    addToCart,
    wishlist,
    toggleWishlist,
    isWishlisted,
    setIsCartOpen 
  } = useStore();

  // Filter products dynamically by category and search
  const filteredProducts = products.filter((product) => {
    if (!product) return false;
    const title = product.title || product.name || '';
    const desc = product.description || '';
    const cat = (product.categorySlug || product.category || '').toLowerCase();

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchTitle = title.toLowerCase().includes(q);
      const matchDesc = desc.toLowerCase().includes(q);
      const matchCat = cat.includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    if (activeCategory === 'all') return true;
    const target = activeCategory.toLowerCase();
    return cat === target || cat.includes(target);
  });

  const handleOpenProductPage = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  return (
    <section 
      id="catalog-section" 
      aria-label="New & Noteworthy Collection" 
      className="py-10 sm:py-16 bg-[#FAF2E9]"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
        
        {/* Section Heading with floral divider */}
        <FloralDivider 
          title="New & Noteworthy" 
          subtitle="FRESH FROM THE PUNE STUDIO • LIMITED ARTISANAL RUNS"
        />

        {/* Minimal Category Filter Pills (rendered dynamically if categories exist) */}
        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-2 mb-8 scrollbar-none no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#B65A37] text-[#FFF9F2] shadow-xs'
                  : 'bg-white/80 text-[#382017] hover:bg-white border border-[#E8D9C8]'
              }`}
            >
              All Pieces
            </button>
            {categories.map((c) => {
              const isSelected = activeCategory === c.slug;
              return (
                <button
                  key={c.id || c.slug}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#B65A37] text-[#FFF9F2] shadow-xs'
                      : 'bg-white/80 text-[#382017] hover:bg-white border border-[#E8D9C8]'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* 
          Mobile Product Grid:
          - Two products per row on mobile (grid-cols-2)
          - Consistent portrait image ratio (aspect-[3/4])
          - Rounded image corners (rounded-2xl)
          - Wishlist heart icon
          - Product name
          - Price in INR, sale price and original price
          - Product detail navigation
        */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white/70 rounded-3xl border border-[#E8D9C8] p-8 max-w-md mx-auto space-y-3">
            <Sparkles className="w-8 h-8 text-[#C69B52] mx-auto opacity-80" />
            <h3 className="font-serif text-lg text-[#382017] font-medium">
              No pieces match this filter
            </h3>
            <p className="text-xs text-[#8C6F5A]">
              Try choosing another collection or view all handcrafted pieces.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-2 px-5 py-2 bg-[#B65A37] text-white rounded-full text-xs uppercase tracking-wider font-medium hover:bg-[#A7472B] transition-colors"
            >
              View Complete Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              const discountPercent = hasDiscount 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                : null;
              const wishlisted = isWishlisted(product.id);

              return (
                <article
                  key={product.id}
                  onClick={() => handleOpenProductPage(product)}
                  className="group flex flex-col cursor-pointer select-none"
                >
                  {/* Portrait Product Image Card */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FFF9F2] border border-[#E8D9C8]/80 shadow-xs group-hover:shadow-editorial group-hover:-translate-y-1 transition-all duration-500">
                    <img
                      src={product.imageUrl || (product.images && product.images[0]) || '/category-kurtas.jpg'}
                      alt={product.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Tag / Badge */}
                    {product.tag && (
                      <span className="absolute top-2.5 left-2.5 bg-[#B65A37]/90 backdrop-blur-xs text-white text-[9px] font-sans font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
                        {product.tag}
                      </span>
                    )}

                    {/* Wishlist Heart Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistClick(e, product.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/85 hover:bg-white backdrop-blur-xs flex items-center justify-center transition-transform active:scale-90 shadow-xs cursor-pointer z-10"
                      aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          wishlisted 
                            ? 'fill-[#D85179] text-[#D85179]' 
                            : 'text-[#382017]/70 hover:text-[#D85179]'
                        }`} 
                      />
                    </button>

                    {/* Quick Add overlay button on hover (desktop) */}
                    <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:block">
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="w-full py-2 bg-[#B65A37] hover:bg-[#A7472B] text-white rounded-xl text-xs font-sans font-medium tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="pt-2.5 px-0.5 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-sans text-[#8C6F5A] tracking-wider uppercase block">
                        {product.category || 'House of Taaga'}
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-medium text-[#382017] group-hover:text-[#B65A37] transition-colors line-clamp-1 leading-snug mt-0.5">
                        {product.title}
                      </h3>
                    </div>

                    {/* Pricing in INR */}
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-sans font-semibold text-sm sm:text-base text-[#A7472B]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="font-sans text-xs text-neutral-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-sans font-bold text-[#D85179]">
                            {discountPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
