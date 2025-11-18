import { API_BASE_URL } from '../constants';
import { FilterType, Match, Stream } from '../types';

// In-memory cache to store API responses
const cache = new Map<string, { data: any, timestamp: number }>();
const MATCH_CACHE_TTL = 60 * 1000; // 1 minute cache for matches
const STREAM_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for stream links

// Helper to handle JSON responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetches matches based on filter type or specific sport with caching
 */
export const fetchMatches = async (filter: FilterType | string): Promise<Match[]> => {
  const cacheKey = `matches-${filter}`;
  const cached = cache.get(cacheKey);

  // Return cached data if valid
  if (cached && Date.now() - cached.timestamp < MATCH_CACHE_TTL) {
    return cached.data;
  }

  // If filter is a known FilterType (live, all, all-today), use it directly
  // Otherwise, treat it as a sport category
  const endpoint = Object.values(FilterType).includes(filter as FilterType)
    ? `/api/matches/${filter}`
    : `/api/matches/${filter}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await handleResponse<Match[]>(response);
    
    // Update cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    // Return expired cache if available to show something rather than nothing
    if (cached) return cached.data;
    return [];
  }
};

/**
 * Fetches specific streams for a source and source-id with caching
 */
export const fetchStreams = async (source: string, id: string): Promise<Stream[]> => {
  const cacheKey = `stream-${source}-${id}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < STREAM_CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/${source}/${id}`);
    const data = await handleResponse<Stream[]>(response);
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Failed to fetch streams:', error);
    if (cached) return cached.data;
    return [];
  }
};

/**
 * Constructs a full image URL from the relative API path
 */
export const getImageUrl = (path?: string): string => {
  if (!path) return 'https://picsum.photos/200/200?grayscale'; // Fallback
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}/api/images/${path}`;
};