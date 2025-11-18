import { API_BASE_URL } from '../constants';
import { FilterType, Match, Stream } from '../types';

// Helper to handle JSON responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
};

/**
 * Fetches matches based on filter type or specific sport
 */
export const fetchMatches = async (filter: FilterType | string): Promise<Match[]> => {
  // If filter is a known FilterType (live, all, all-today), use it directly
  // Otherwise, treat it as a sport category
  const endpoint = Object.values(FilterType).includes(filter as FilterType)
    ? `/api/matches/${filter}`
    : `/api/matches/${filter}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleResponse<Match[]>(response);
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return [];
  }
};

/**
 * Fetches specific streams for a source and source-id
 */
export const fetchStreams = async (source: string, id: string): Promise<Stream[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/${source}/${id}`);
    return handleResponse<Stream[]>(response);
  } catch (error) {
    console.error('Failed to fetch streams:', error);
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
