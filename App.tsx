import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { MatchCard } from './components/MatchCard';
import { StreamPlayer } from './components/StreamPlayer';
import { fetchMatches, fetchStreams } from './services/apiService';
import { FilterType, Match } from './types';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(FilterType.LIVE);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data when category changes
  useEffect(() => {
    let isMounted = true;

    const loadMatches = async () => {
      setLoading(true);
      setMatches([]); // Clear previous to show loading state visually
      const data = await fetchMatches(activeCategory);
      
      if (isMounted) {
        setMatches(data);
        setLoading(false);
      }
    };

    loadMatches();

    // Set up auto-refresh interval for LIVE category (every 60s)
    let interval: ReturnType<typeof setInterval>;
    if (activeCategory === FilterType.LIVE) {
        interval = setInterval(loadMatches, 60000);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [activeCategory]);

  // Filter matches based on search query
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return matches;
    
    const query = searchQuery.toLowerCase();
    return matches.filter(match => 
      match.title.toLowerCase().includes(query) ||
      match.teams?.home?.name.toLowerCase().includes(query) ||
      match.teams?.away?.name.toLowerCase().includes(query) ||
      match.category.toLowerCase().includes(query)
    );
  }, [matches, searchQuery]);

  // Prefetch streams when hovering over a match card to reduce perceived latency
  const handleMatchHover = (match: Match) => {
    if (match.sources && match.sources.length > 0) {
      // Prefetch the first source as it's the most likely to be clicked
      fetchStreams(match.sources[0].source, match.sources[0].id)
        .catch(() => {}); // Ignore errors on prefetch
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col font-sans">
      <Navbar 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white capitalize">
              {activeCategory === 'all-today' ? "Today's Matches" : activeCategory.replace('-', ' ')}
            </h1>
            <p className="text-zinc-400 mt-2">
              {loading ? 'Checking for events...' : `Found ${filteredMatches.length} events`}
            </p>
          </div>
          
          {!loading && activeCategory === FilterType.LIVE && (
             <div className="flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full animate-pulse border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Live Updates Active
             </div>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-xl h-48 border border-zinc-800/50"></div>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                onClick={setSelectedMatch}
                onHover={handleMatchHover}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-500">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No matches found</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              We couldn't find any matches for this category right now. Try checking "All Events" or a different sport.
            </p>
            {activeCategory !== FilterType.ALL && (
                <button 
                   onClick={() => setActiveCategory(FilterType.ALL)}
                   className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                   View All Events
                </button>
            )}
          </div>
        )}
      </main>

      {/* Player Modal */}
      {selectedMatch && (
        <StreamPlayer 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </div>
  );
};

export default App;