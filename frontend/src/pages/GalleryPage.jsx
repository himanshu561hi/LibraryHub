import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Camera,
  X,
  Maximize2,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import SectionHeading from '../components/common/SectionHeading';
import ImagePlaceholder from '../components/common/ImagePlaceholder';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { galleryItems, galleryCategories } from '../data/gallery';

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalItem, setActiveModalItem] = useState(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveModalItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items
  const filteredItems = galleryItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div className="flex-1 py-8 sm:py-10 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb & Hero */}
        <section className="space-y-6">
          <Breadcrumb items={[{ label: 'Photo Gallery' }]} />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold-50 text-brand-gold-900 border border-brand-gold-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
              <span>Library Tour & Visual Preview</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-brand-navy-950 tracking-tight leading-tight">
              A Tour of Library Hub Nawalpur
            </h1>

            <p className="text-base sm:text-lg text-brand-navy-700 leading-relaxed">
              Explore the study cabins, air-conditioned reading halls, lighting, and amenities. 
              As real photographs are captured and provided by the owner, they will be showcased here.
            </p>
          </div>
        </section>

        {/* Owner Photo Notice */}
        <div className="p-4 sm:p-5 rounded-xl bg-brand-surface-muted border border-brand-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-brand-navy-700">
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-brand-gold-600 shrink-0" />
            <span>
              <strong>Authenticity Commitment:</strong> We strictly avoid generic stock images. All frames below are prepared placeholders awaiting verified photographs from Library Hub Nawalpur.
            </span>
          </div>
          <span className="font-semibold px-2.5 py-0.5 rounded bg-brand-surface-card border border-brand-surface-border text-brand-navy-800 text-[11px] shrink-0">
            Real Photos Pending
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {galleryCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-navy-900 text-white shadow-soft-sm'
                  : 'bg-brand-surface-card text-brand-navy-700 border border-brand-surface-border hover:bg-brand-surface-muted hover:border-brand-surface-borderHover'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveModalItem(item)}
              className="group cursor-pointer rounded-card overflow-hidden bg-brand-surface-card border border-brand-surface-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg hover:border-brand-gold-300 flex flex-col justify-between"
            >
              <div className="relative">
                <ImagePlaceholder
                  src={item.src}
                  alt={item.title}
                  label={item.title}
                  subtext="Click to preview details"
                  aspectRatio={item.aspectRatio}
                  category={item.category}
                  objectFit={item.objectFit || 'object-cover'}
                  imageClassName={item.imageClassName || ''}
                />
                <div className="absolute inset-0 bg-brand-navy-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-brand-navy-950 text-xs font-semibold shadow-soft">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-700">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-brand-navy-400 font-mono">
                    {item.dimensions}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-brand-navy-950 group-hover:text-brand-navy-800 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-navy-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Lightbox / Details Modal */}
        <AnimatePresence>
          {activeModalItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy-950/70 backdrop-blur-sm"
              onClick={() => setActiveModalItem(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative max-w-2xl w-full bg-brand-surface-card rounded-2xl border border-brand-surface-border shadow-soft-xl overflow-hidden p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setActiveModalItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-lg text-brand-navy-500 hover:text-brand-navy-900 hover:bg-brand-surface-muted transition-colors"
                  aria-label="Close image modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-brand-surface-border">
                    <ImagePlaceholder
                      src={activeModalItem.src}
                      alt={activeModalItem.title}
                      label={activeModalItem.title}
                      subtext="Actual photo to be added by owner into src/assets/images/"
                      aspectRatio={activeModalItem.aspectRatio || 'aspect-video'}
                      category={activeModalItem.category}
                      objectFit={activeModalItem.objectFit || 'object-cover'}
                      imageClassName={activeModalItem.imageClassName || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold" size="xs">
                        {activeModalItem.category}
                      </Badge>
                      <span className="text-xs text-brand-navy-400 font-mono">
                        Target resolution: {activeModalItem.dimensions}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-extrabold text-brand-navy-950">
                      {activeModalItem.title}
                    </h3>

                    <p className="text-sm text-brand-navy-700 leading-relaxed">
                      {activeModalItem.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-brand-surface-muted border border-brand-surface-border flex items-center gap-2 text-xs text-brand-navy-600">
                    <Info className="w-4 h-4 text-brand-gold-600 shrink-0" />
                    <span>
                      When the library owner uploads the real photo, this frame will seamlessly render the actual photograph.
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <section className="p-8 sm:p-12 rounded-2xl bg-brand-navy-950 text-white text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Want to See Library Hub Nawalpur with Your Own Eyes?
          </h2>
          <p className="text-xs sm:text-sm text-brand-navy-200 max-w-lg mx-auto">
            Physical visits are welcome every day. Come take a look at our reading hall in person.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="gold" size="lg" icon={ArrowRight} iconPosition="right">
              Get Directions & Inquire
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}
