
import React from 'react';
import { Maximize2, Map as MapIcon } from 'lucide-react';

interface MapViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  title?: string;
}

const MapView: React.FC<MapViewProps> = ({ lat, lng, zoom = 15, title = "Current Location" }) => {
  // Using OpenStreetMap for a reliable, no-API-key-required interactive map
  // We'll style the container to look high-tech and integrated
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.005}%2C${lng + 0.01}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="glass rounded-[2rem] overflow-hidden border border-white/50 shadow-lg group relative">
      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2 shadow-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</span>
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')}
          className="p-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl border border-white/20 shadow-sm hover:scale-105 transition-transform"
        >
          <Maximize2 size={14} className="text-red-600" />
        </button>
      </div>

      <div className="h-48 w-full bg-gray-200 dark:bg-zinc-800 relative">
        <iframe
          title="SafeMap"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
          className="grayscale-[0.5] contrast-[1.1] invert-0 dark:invert-[0.9] dark:hue-rotate-180 transition-all duration-700"
        />
        {/* Decorative overlay for that high-tech feel */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent group-hover:border-red-500/5 transition-all duration-500"></div>
      </div>
      
      <div className="p-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm flex justify-between items-center border-t border-white/20">
        <div className="flex items-center gap-2 text-[10px] font-medium opacity-60">
          <MapIcon size={12} />
          <span>LIVE TRACKING DATA • {lat.toFixed(4)}, {lng.toFixed(4)}</span>
        </div>
        <span className="text-[10px] font-bold text-green-500">SIGNAL STRENGTH: OPTIMAL</span>
      </div>
    </div>
  );
};

export default MapView;
