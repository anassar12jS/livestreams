import React, { useEffect, useState } from 'react';
import { Match, Stream } from '../types';
import { fetchStreams } from '../services/apiService';
import { Badge } from './Badge';

interface StreamPlayerProps {
  match: Match;
  onClose: () => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({ match, onClose }) => {
  const [availableStreams, setAvailableStreams] = useState<Stream[]>([]);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSourceId, setActiveSourceId] = useState<string>('');

  // Load streams from the first source initially
  useEffect(() => {
    const loadInitialStreams = async () => {
      if (!match.sources || match.sources.length === 0) {
        setError('No sources available for this match.');
        setLoading(false);
        return;
      }

      try {
        // Default to first source
        const firstSource = match.sources[0];
        setActiveSourceId(firstSource.source);
        await loadStreamsForSource(firstSource.source, firstSource.id);
      } catch (err) {
        setError('Failed to load streams.');
        setLoading(false);
      }
    };

    loadInitialStreams();
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  const loadStreamsForSource = async (sourceName: string, sourceId: string) => {
    setLoading(true);
    setAvailableStreams([]); 
    setActiveSourceId(sourceName);
    setCurrentStream(null); // Reset current stream while loading new source to avoid confusion
    
    try {
      const streams = await fetchStreams(sourceName, sourceId);
      setAvailableStreams(streams);
      if (streams.length > 0) {
        // Auto-select HD stream if available, otherwise first
        const bestStream = streams.find(s => s.hd) || streams[0];
        setCurrentStream(bestStream);
        setError('');
      } else {
        setError(`No streams found for source: ${sourceName}`);
      }
    } catch (err) {
      setError('Error fetching streams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Maximized container size for "Theater Mode" experience */}
      <div className="relative w-full h-full max-w-[98vw] xl:max-w-[1800px] max-h-[95vh] bg-app-card border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-white leading-tight truncate">{match.title}</h2>
                <p className="text-xs text-zinc-400 truncate">{match.category} • {new Date(match.date).toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hidden lg:block p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-full">
          {/* Video Area - Takes maximum available space */}
          <div className="flex-1 bg-black relative group flex items-center justify-center w-full h-[50vh] lg:h-auto shrink-0 lg:shrink">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-900/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-zinc-400 animate-pulse">Connecting to satellite...</span>
                </div>
              </div>
            )}
            
            {error && !loading && (
               <div className="text-center p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-red-400 mb-2 font-medium">Stream Unavailable</div>
                  <p className="text-zinc-500 text-sm">{error}</p>
                  <button 
                    onClick={() => loadStreamsForSource(activeSourceId, match.sources.find(s => s.source === activeSourceId)?.id || '')}
                    className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                  >
                    Retry Connection
                  </button>
               </div>
            )}

            {currentStream && !loading && !error && (
              <iframe
                src={currentStream.embedUrl}
                title="Stream Player"
                className="w-full h-full absolute inset-0"
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
          </div>

          {/* Controls & Playlist Sidebar */}
          <div className="w-full lg:w-80 xl:w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col h-[40vh] lg:h-full shrink-0">
            
            {/* Source Selectors */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Source</h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                    {match.sources.length} Available
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin">
                {match.sources.map((src) => (
                  <button
                    key={`${src.source}-${src.id}`}
                    onClick={() => loadStreamsForSource(src.source, src.id)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all border ${
                      activeSourceId === src.source
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white hover:border-zinc-600'
                    }`}
                  >
                    {src.source}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Streams List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {availableStreams.length > 0 ? (
                <>
                <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    Available Channels
                </div>
                {availableStreams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setCurrentStream(stream)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all group ${
                      currentStream?.id === stream.id
                        ? 'bg-zinc-800 border border-zinc-700 ring-1 ring-blue-500/50'
                        : 'hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col">
                       <span className={`text-sm font-medium ${currentStream?.id === stream.id ? 'text-blue-400' : 'text-zinc-200 group-hover:text-white'}`}>
                           Stream {stream.streamNo}
                       </span>
                       <span className="text-xs text-zinc-500">{stream.language}</span>
                    </div>
                    {stream.hd && <Badge variant="hd" className="shadow-sm">HD</Badge>}
                  </button>
                ))}
                </>
              ) : (
                 !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                       <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                       </svg>
                       <span className="text-xs">Select a source to view streams</span>
                    </div>
                 )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};