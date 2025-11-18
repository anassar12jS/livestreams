
import React, { useEffect, useState } from 'react';
import { getTeamDetails } from '../services/footballService';
import { getImageUrl } from '../services/apiService';

interface TeamLogoProps {
  name: string;
  badgePath?: string;
  sport: string;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ name, badgePath, sport, className }) => {
  const [apiLogo, setApiLogo] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Resolve the initial image from streamed.pk
  const initialSrc = badgePath ? getImageUrl(badgePath) : null;

  useEffect(() => {
    let isMounted = true;

    const fetchEnhancedData = async () => {
      // Only attempt to fetch if it's football, as our API key is for football
      if (sport === 'football') {
        const data = await getTeamDetails(name, sport);
        if (isMounted && data) {
          setApiLogo(data.logo);
          setCountry(data.country);
        }
      }
    };

    fetchEnhancedData();

    return () => {
      isMounted = false;
    };
  }, [name, sport]);

  // Determine which image source to use
  // Priority: API Logo > Streamed.pk Badge > Placeholder
  const source = !imgError && apiLogo ? apiLogo : (initialSrc || 'https://picsum.photos/50/50?grayscale');

  return (
    <div className={`relative group/logo ${className}`}>
      <img 
        src={source} 
        alt={name} 
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover/logo:scale-110"
        onError={() => {
            // If API logo fails, try to revert to initial, then fallback
            if (source === apiLogo && initialSrc) {
                setApiLogo(null); // Fallback to initial
            } else {
                setImgError(true); // Fallback to placeholder
            }
        }}
      />
      
      {/* Country Flag Indicator (Only if we have country info from API) */}
      {country && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-700 shadow-md z-10" title={country}>
             {/* We don't have direct flag URLs, but we can use a generic world icon or text code if needed. 
                 For now, we render a small dot to indicate we have metadata. 
                 If we want real flags, we'd need a mapping of country name -> flag code. 
             */}
             <div className="text-[8px] font-bold text-zinc-400 select-none">
                {country.slice(0, 2).toUpperCase()}
             </div>
        </div>
      )}
    </div>
  );
};
