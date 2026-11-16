import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FloralDivider } from './FloralDecorations';

export const TaagaJournalSection = () => {
  const { setIsAboutOpen } = useStore();

  const journalArticles = [
    {
      id: 'journal_1',
      tag: 'TEXTILE CRAFTSMANSHIP',
      title: 'The Art of Bandhani & Golden Zari',
      subtitle: 'From Kutch artisans to our Pune studio, exploring traditional tie-dye resist techniques.',
      imageUrl: '/category-kurtas.jpg',
      readTime: '3 min read',
    },
    {
      id: 'journal_2',
      tag: 'BEHIND THE LABEL',
      title: 'Mother, Daughter & Morning Chai',
      subtitle: 'How kitchen conversations about forgotten heirloom silhouettes turned into House of Taaga.',
      imageUrl: '/founders.jpg',
      readTime: '4 min read',
    },
    {
      id: 'journal_3',
      tag: 'EDITORIAL LOOKBOOK',
      title: 'Six Yards of Handwoven Poetry',
      subtitle: 'The meditative rhythm of Chanderi looms and hand-beaded borders for timeless festive moments.',
      imageUrl: '/category-sarees.jpg',
      readTime: '3 min read',
    },
    {
      id: 'journal_4',
      tag: 'SLOW FASHION',
      title: 'Festive Kaftans in Natural Light',
      subtitle: 'Bridging effortless contemporary fits with hand-embroidered Kashmiri and royal zari yokes.',
      imageUrl: '/category-festive.jpg',
      readTime: '5 min read',
    },
  ];

  return (
    <section 
      id="journal-section"
      aria-label="The Taaga Journal" 
      className="py-12 sm:py-16 bg-[#FAF2E9] overflow-hidden"
    >
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4">
        
        {/* Section Heading & Subtitle exactly matching prompt */}
        <FloralDivider 
          title="The Taaga Journal"
          subtitle="LOOKBOOK • PEOPLE • BEHIND THE LABEL"
          className="mb-8 sm:mb-10"
        />

        {/* 
          Horizontally scrollable on mobile; 4-column balanced editorial grid on desktop
          - Authentic brand photography and textile close-ups
          - Subtle rounded corners
          - Consistent proportions
          - Smooth touch scrolling with snap points on mobile
        */}
        <div className="flex md:grid md:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto md:overflow-visible pb-4 pt-1 px-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory">
          {journalArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => setIsAboutOpen(true)}
              className="w-[260px] sm:w-[280px] md:w-full shrink-0 md:shrink snap-start group cursor-pointer flex flex-col bg-[#FFF9F2] rounded-2xl overflow-hidden border border-[#E8D9C8] shadow-xs hover:shadow-editorial hover:-translate-y-1 transition-all duration-500"
            >
              {/* Editorial Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF2E9]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#FAF2E9]/90 backdrop-blur-xs text-[#B65A37] text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                  {article.tag}
                </div>
              </div>

              {/* Text Card Content */}
              <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-medium text-[#382017] group-hover:text-[#B65A37] transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#7D5E43] font-sans font-light leading-relaxed line-clamp-2">
                    {article.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0E4D5] flex items-center justify-between text-[11px] text-[#A7472B] font-medium font-sans">
                  <span>{article.readTime}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Note</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
