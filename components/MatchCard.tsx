
import React from 'react';
import { Match } from '../types';
import { getImageUrl } from '../services/apiService';
import { Badge } from './Badge';
import { TeamLogo } from './TeamLogo';

interface MatchCardProps {
  match: Match;
  onClick: (match: Match) => void;
  onHover?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, onHover }) => {
  const matchDate = new Date(match.date);
  const isLive = match.sources.length > 0 && (Date.now() >= match.date - 15 * 60 * 1000); // Assume live if sources exist and time is past or near start
  
  // Format time
  const timeString = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const homeTeam = match.teams?.home;
  const awayTeam = match.teams?.away;
  const hasTeams = homeTeam && awayTeam;

  return (
    <div 
      onClick={() => onClick(match)}
      onMouseEnter={() => onHover?.(match)}
      className="group relative flex flex-col bg-app-card hover:bg-zinc-800 border border-zinc-800/50 hover:border-zinc-700 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
    >
      {/* Card Header / Image Background if no teams */}
      {!hasTeams && match.poster ? (
         <div className="relative h-40 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-app-card to-transparent z-10" />
            <img 
              src={getImageUrl(match.poster)} 
              alt={match.title} 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 z-20">
               {isLive && <Badge variant="live">Live</Badge>}
            </div>
         </div>
      ) : (
        <div className="relative p-4 pb-0">
           <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{match.category}</span>
              {isLive ? <Badge variant="live">Live</Badge> : <span className="text-xs text-zinc-500 font-mono">{timeString}</span>}
           </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        {hasTeams ? (
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center gap-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900/50 rounded-full p-2 border border-zinc-800 group-hover:border-zinc-600 transition-colors shadow-inner">
                <TeamLogo 
                  name={homeTeam.name} 
                  badgePath={homeTeam.badge} 
                  sport={match.category}
                />
              </div>
              <span className="text-sm font-semibold text-zinc-200 leading-tight line-clamp-2">{homeTeam.name}</span>
            </div>

            {/* VS / Score */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-zinc-600 text-xs font-bold">VS</span>
              {!isLive && <span className="text-[10px] text-zinc-500 mt-1">{dateString}</span>}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center gap-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900/50 rounded-full p-2 border border-zinc-800 group-hover:border-zinc-600 transition-colors shadow-inner">
                <TeamLogo 
                  name={awayTeam.name} 
                  badgePath={awayTeam.badge} 
                  sport={match.category}
                />
              </div>
              <span className="text-sm font-semibold text-zinc-200 leading-tight line-clamp-2">{awayTeam.name}</span>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
              {match.title}
            </h3>
            <p className="text-sm text-zinc-500">
              {dateString} • {timeString}
            </p>
          </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 group-hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {match.sources.length > 0 ? (
                match.sources.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-zinc-900" />
                ))
              ) : (
                <span className="text-xs text-zinc-600">No streams yet</span>
              )}
            </div>
            {match.sources.length > 0 && <span className="text-xs text-zinc-400">{match.sources.length} Sources</span>}
         </div>
         <svg className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
         </svg>
      </div>
    </div>
  );
};
