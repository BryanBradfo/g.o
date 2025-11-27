
import React, { useState, useEffect } from 'react';
import { Activity } from '../types';
import { MapPin, DollarSign, Star, Navigation, Info, ExternalLink } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onSelect: (activity: Activity) => void;
  locationContext: string;
  userCoords: { lat: number; lng: number } | null;
}

// Larger collection of fallbacks to ensure diversity if search fails
const FALLBACK_COLLECTIONS: Record<string, string[]> = {
  'Food': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=600&q=80'
  ],
  'Nightlife': [
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535403306990-26462e783455?auto=format&fit=crop&w=600&q=80'
  ],
  'Activity': [
    'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80'
  ],
  'Culture': [
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=600&q=80'
  ],
  'Outdoors': [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80'
  ],
  'default': ['https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=600&q=80']
};

const getRandomFallback = (category: string, id: string) => {
  const collection = FALLBACK_COLLECTIONS[category] || FALLBACK_COLLECTIONS['default'];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return collection[hash % collection.length];
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isSelected, onSelect, locationContext, userCoords }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    // Construct a specific search query: "Place Name" + "City" + "Photography"
    const query = encodeURIComponent(`${activity.name} ${locationContext} photography`);
    const searchUrl = `https://tse3.mm.bing.net/th?q=${query}&w=600&h=600&c=7&rs=1&p=0`;
    setImgSrc(searchUrl);
  }, [activity.name, locationContext]);

  const handleImageError = () => {
    setImgSrc(getRandomFallback(activity.category, activity.id));
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const originParam = userCoords ? `&origin=${userCoords.lat},${userCoords.lng}` : '';
    const destinationParam = `&destination=${activity.coordinates.lat},${activity.coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1${originParam}${destinationParam}&travelmode=transit`;
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={() => onSelect(activity)}
      className={`
        w-full p-3 mb-3 rounded-xl cursor-pointer transition-all duration-300 border relative overflow-hidden flex flex-col
        ${isSelected 
          ? 'bg-urban-card border-urban-neon shadow-[0_0_15px_rgba(0,240,255,0.2)]' 
          : 'bg-urban-dark/95 border-gray-800 hover:border-gray-600 hover:bg-urban-card/90'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Image Thumbnail - Fixed Size */}
        <div className="w-24 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative">
          <img 
              src={imgSrc} 
              alt={activity.name}
              onError={handleImageError}
              onLoad={handleImageLoad}
              className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />
          {isLoading && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-urban-purple border-t-transparent rounded-full animate-spin"></div>
              </div>
          )}
        </div>

        {/* Header Content */}
        <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex justify-between items-start mb-1">
              <h3 className={`font-bold text-base pr-2 leading-tight ${isSelected ? 'text-xl text-urban-neon' : 'text-white truncate'}`}>
                {activity.name}
              </h3>
              <div className={`
                  flex-shrink-0 flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border 
                  ${isSelected ? 'bg-urban-purple/20 text-urban-purple border-urban-purple/50' : 'bg-gray-800 text-gray-400 border-gray-700'}
              `}>
                <Star size={10} fill="currentColor" />
                <span>{activity.vibeScore}%</span>
              </div>
            </div>

            {/* Short Description (Hidden when selected to avoid duplicate info with full description) */}
            {!isSelected && (
                <p className="text-gray-400 text-xs leading-relaxed mb-2 line-clamp-2">
                    {activity.description}
                </p>
            )}

            {!isSelected && (
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
                    <span className="flex items-center gap-1 font-medium text-gray-400">
                        <MapPin size={10} /> {activity.category}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-gray-400">
                        <DollarSign size={10} /> {activity.pricePerPerson}
                    </span>
                    {activity.distance && (
                        <span className="flex items-center gap-1 text-urban-neon font-semibold ml-auto">
                            <Navigation size={10} />
                            {activity.distance}
                        </span>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Expanded Content Area - Below the image/header row */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-gray-800/50 animate-in slide-in-from-top-2 duration-300">
             {/* Full Description */}
             <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {activity.fullDescription || activity.description}
             </p>
             
             {/* Match Reason */}
             <div className="mb-3 p-2 bg-urban-purple/10 border border-urban-purple/20 rounded-lg">
                <div className="flex items-center gap-1.5 text-urban-purple text-xs font-bold mb-1">
                    <Info size={12} />
                    <span>Why it matches:</span>
                </div>
                <p className="text-gray-300 text-xs italic">"{activity.matchReason}"</p>
            </div>

            {/* Address */}
             {activity.address && (
                 <div className="flex items-start gap-1.5 text-gray-400 text-xs mb-3">
                     <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                     <span>{activity.address}</span>
                 </div>
            )}

            {/* Footer Stats (Visible here when selected) */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                 <div className="flex gap-4">
                     <span className="flex items-center gap-1">
                        <MapPin size={12} /> {activity.category}
                     </span>
                     <span className="flex items-center gap-1">
                        <DollarSign size={12} /> {activity.pricePerPerson}
                     </span>
                 </div>
                 {activity.distance && (
                    <span className="flex items-center gap-1 text-urban-neon font-bold">
                        <Navigation size={12} />
                        {activity.distance}
                    </span>
                 )}
            </div>

            {/* Navigation Button */}
            <button
                onClick={handleNavigate}
                className="w-full py-2.5 bg-urban-neon/10 hover:bg-urban-neon/20 border border-urban-neon/50 hover:border-urban-neon text-urban-neon rounded-lg font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
                <ExternalLink size={14} />
                Go There (Google Maps)
            </button>
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
