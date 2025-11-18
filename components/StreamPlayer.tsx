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
      } finally {
        setLoading(false);
      }
    };

    loadInitialStreams();
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  const loadStreamsForSource = async (sourceName: string, sourceId: string) => {
    setLoading(true);
    setAvailableStreams([]); // Clear current list
    setActiveSourceId(sourceName);
    
    try {
      const streams = await fetchStreams(sourceName, sourceId);
      setAvailableStreams(streams);
      if (streams.length > 0) {
        setCurrentStream(streams[0]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl bg-app-card border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-semibold text-white leading-tight line-clamp-1">{match.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{match.category} • {new Date(match.date).toLocaleString()}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 bg-black relative group flex items-center justify-center aspect-video lg:aspect-auto">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && !loading && (
               <div className="text-center p-8">
                  <div className="text-red-400 mb-2 font-medium">Stream Unavailable</div>
                  <p className="text-zinc-500 text-sm">{error}</p>
               </div>
            )}

            {currentStream && !loading && !error && (
              <iframe
                src={currentStream.embedUrl}
                title="Stream Player"
                className="w-full h-full absolute inset-0"
                allowFullScreen
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
          </div>

          {/* Controls & Playlist Sidebar */}
          <div className="w-full lg:w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-64 lg:h-auto">
            
            {/* Source Selectors */}
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Sources</h3>
              <div className="flex flex-wrap gap-2">
                {match.sources.map((src) => (
                  <button
                    key={`${src.source}-${src.id}`}
                    onClick={() => loadStreamsForSource(src.source, src.id)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors border ${
                      activeSourceId === src.source
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {src.source}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Streams List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableStreams.length > 0 ? (
                availableStreams.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setCurrentStream(stream)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all ${
                      currentStream?.id === stream.id
                        ? 'bg-zinc-800 border border-zinc-700 ring-1 ring-zinc-600'
                        : 'hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col">
                       <span className="text-sm font-medium text-zinc-200">Stream {stream.streamNo}</span>
                       <span className="text-xs text-zinc-500">{stream.language}</span>
                    </div>
                    {stream.hd && <Badge variant="hd">HD</Badge>}
                  </button>
                ))
              ) : (
                 !loading && (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                       Select a source to view streams
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