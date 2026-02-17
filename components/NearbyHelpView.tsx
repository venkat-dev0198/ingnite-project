
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ExternalLink, Loader2, Navigation, Building2, ShieldCheck, HeartPulse } from 'lucide-react';
import { getNearbyHelp } from '../services/geminiService';
import { NearbyPlace } from '../types';
import MapView from './MapView';

interface NearbyHelpViewProps {
  location: { lat: number; lng: number } | null;
}

const NearbyHelpView: React.FC<NearbyHelpViewProps> = ({ location }) => {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [analysis, setAnalysis] = useState<string>('');

  const fetchNearby = async () => {
    if (!location) return;
    setLoading(true);
    const { places: fetchedPlaces, text } = await getNearbyHelp(location.lat, location.lng);
    setPlaces(fetchedPlaces);
    setAnalysis(text);
    setLoading(false);
  };

  useEffect(() => {
    fetchNearby();
  }, [location?.lat, location?.lng]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Police': return <ShieldCheck className="text-blue-500" />;
      case 'Hospital': return <HeartPulse className="text-red-500" />;
      default: return <Building2 className="text-amber-500" />;
    }
  };

  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
        <MapPin size={48} className="mb-4" />
        <p>Awaiting location access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Safe Zones</h2>
          <p className="text-sm opacity-60">Verified nearby emergency points</p>
        </div>
        <button 
          onClick={fetchNearby}
          className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-bold active:scale-95 transition-transform"
        >
          REFRESH
        </button>
      </div>

      {/* Interactive Map Overview */}
      <MapView lat={location.lat} lng={location.lng} title="Safety Perimeter" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
          <p className="text-sm font-medium animate-pulse">Scanning safety perimeter with AI...</p>
        </div>
      ) : (
        <>
          {analysis && (
            <div className="glass p-5 rounded-[2rem] border-l-4 border-red-500 animate-in fade-in slide-in-from-left-4 duration-500">
               <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                 <Navigation size={16} /> Area Safety Analysis
               </h3>
               <p className="text-sm opacity-80 leading-relaxed italic">
                 {analysis}
               </p>
            </div>
          )}

          <div className="space-y-3">
            {places.length > 0 ? (
              places.map((place, i) => (
                <a 
                  key={i} 
                  href={place.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="glass p-4 rounded-3xl flex items-center justify-between hover:bg-white dark:hover:bg-zinc-800 transition-all hover:scale-[1.02] shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
                      {getTypeIcon(place.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{place.name}</h4>
                      <p className="text-xs opacity-50">{place.type}</p>
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-gray-400" />
                </a>
              ))
            ) : (
              <div className="p-8 text-center opacity-50 border-2 border-dashed rounded-[2rem]">
                No specific safe zones pinpointed yet.
              </div>
            )}
          </div>

          <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
            <h3 className="font-bold mb-1">Standard Help Numbers</h3>
            <p className="text-xs opacity-80 mb-4">Tap to call emergency helplines directly.</p>
            <div className="grid grid-cols-2 gap-2">
              <a href="tel:112" className="bg-white/10 p-3 rounded-xl flex items-center justify-between hover:bg-white/20 transition-colors">
                <span className="font-bold">112</span>
                <span className="text-[10px]">National</span>
              </a>
              <a href="tel:1091" className="bg-white/10 p-3 rounded-xl flex items-center justify-between hover:bg-white/20 transition-colors">
                <span className="font-bold">1091</span>
                <span className="text-[10px]">Women</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NearbyHelpView;
