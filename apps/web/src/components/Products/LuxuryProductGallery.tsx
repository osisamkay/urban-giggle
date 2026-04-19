import React, { useState, useEffect } from 'react';
import { Play, Maximize2, Award, CheckCircle } from 'lucide-react';

interface ProductMedia {
  url: string;
  media_type: 'VIDEO' | 'IMAGE_360' | 'GALLERY_IMAGE';
}

export default function LuxuryProductGallery({ productId, media }: { productId: string; media: ProductMedia[] }) {
  const [activeMedia, setActiveMedia] = useState(media[0] || null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!media || media.length === 0) {
    return <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center text-zinc-400">No media available</div>;
  }

  return (
    <div className="space-y-4">
      <div className={`relative rounded-3xl overflow-hidden bg-black aspect-square shadow-2xl transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
        {activeMedia?.media_type === 'VIDEO' && (
          <video 
            src={activeMedia.url} 
            className="w-full h-full object-cover" 
            controls 
            autoPlay 
            muted 
            loop 
          />
        )}
        {activeMedia?.media_type === 'IMAGE_360' && (
          <div className="w-full h-full relative group cursor-ew-resize">
            <img src={activeMedia.url} className="w-full h-full object-cover" alt="360 view" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-widest">
              Drag to rotate 360°
            </div>
          </div>
        )}
        {activeMedia?.media_type === 'GALLERY_IMAGE' && (
          <img src={activeMedia.url} className="w-full h-full object-cover" alt="Product" />
        )}

        <button 
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {media.map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveMedia(item)}
            className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeMedia?.url === item.url ? 'border-red-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            {item.media_type === 'VIDEO' && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><Play size={16} className="text-white" /></div>}
            <img src={item.url} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
