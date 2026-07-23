import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  bgImage?: string;
}

const BACKGROUND_IMAGES = [
  "/bg.jpg",
  "/bg-1.jpeg",
  "/bg-2.jpg",
  "/bg-3.jpg",
  "/bg-4.jpg",
  "/bg-5.jpg",
  "/bg-6.jpg",
];

export default function PageHero({ title, subtitle, bgImage }: PageHeroProps) {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    if (bgImage) return;
    
    // Preload images
    BACKGROUND_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [bgImage]);

  const activeImages = bgImage ? [bgImage] : BACKGROUND_IMAGES;

  return (
    <section className="relative min-h-[95vh] flex flex-col justify-center pt-32 pb-24 lg:pt-48 lg:pb-32 text-center px-4 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 w-full h-full bg-primary-950 z-0 overflow-hidden">
        {activeImages.map((img, idx) => (
          <img 
            key={idx}
            src={img} 
            alt={`${title} Background ${idx + 1}`} 
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1500ms] ease-in-out brightness-75 ${
              bgImage 
                ? 'opacity-100 z-10 scale-100'
                : idx === currentBg 
                 ? 'opacity-100 z-10 scale-100' 
                 : idx === (currentBg === 0 ? BACKGROUND_IMAGES.length - 1 : currentBg - 1)
                  ? 'opacity-100 z-0 scale-105'
                  : 'opacity-0 z-0 scale-105'
            }`}
          />
        ))}
        
        {/* Subtle world map / abstract pattern */}
        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] mix-blend-overlay"></div>

        {/* Soft curved flight-path lines & geometric accents */}
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none opacity-40 mix-blend-lighten" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <path d="M -200 600 C 300 100, 800 700, 1600 300" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" strokeDasharray="6 8" />
          <path d="M -100 400 C 400 50, 900 800, 1500 100" fill="none" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="800" cy="450" r="3" fill="rgba(212, 175, 55, 0.5)" className="animate-pulse" />
          <circle cx="300" cy="290" r="2.5" fill="rgba(255, 255, 255, 0.4)" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="1100" cy="550" r="2.5" fill="rgba(255, 255, 255, 0.4)" className="animate-pulse" style={{ animationDelay: '2s' }} />
        </svg>

        {/* Premium dark blue gradient overlays (adjusted for better visibility) & Lighting */}
        <div className="absolute inset-0 bg-black/60 z-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/30 to-transparent z-20 pointer-events-none"></div>
        
        {/* Radial depth effect / glassmorphism base */}
        <div className="absolute inset-0 bg-primary-950/20 z-20 pointer-events-none"></div>

        {/* Navigation Indicators */}
        {!bgImage && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex items-center justify-center space-x-3">
            {BACKGROUND_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBg(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                  idx === currentBg 
                    ? 'w-10 bg-gold-500 opacity-100 shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                    : 'w-6 bg-white/40 hover:bg-white/70 hover:w-8 opacity-70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto relative z-30">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] leading-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="inline-block px-6 py-3 rounded-xl bg-black/40 text-gray-100 font-medium text-lg md:text-xl border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.3)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-3xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
