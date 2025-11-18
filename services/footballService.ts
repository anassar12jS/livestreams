
import { Match } from '../types';

const API_KEY = 'a999fae60c223e8c13d6f21b0b5d1f42';
const BASE_URL = 'https://v3.football.api-sports.io';

interface TeamData {
  logo: string;
  country?: string;
}

// Cache structure constants
const CACHE_KEY_PREFIX = 'streamzone_team_v1_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 Days

// Queue system to prevent rate limiting (API-Football Free Tier is 10 requests/sec max, usually 100/day)
const QUEUE_DELAY = 300; // ms between requests
let requestQueue: Promise<any> = Promise.resolve();

const enqueueRequest = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = requestQueue.then(() => new Promise(resolve => setTimeout(resolve, QUEUE_DELAY))).then(fn);
  requestQueue = next.catch(() => {}); // Ensure queue continues even if a request fails
  return next;
};

export const getTeamDetails = async (teamName: string, sport: string): Promise<TeamData | null> => {
  // This API only supports football
  if (sport.toLowerCase() !== 'football' && sport.toLowerCase() !== 'soccer') {
    return null;
  }

  const cleanName = teamName.trim();
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  // 1. Check Local Storage Cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to read from local storage', e);
  }

  // 2. Fetch from API via Queue
  return enqueueRequest(async () => {
    try {
      const response = await fetch(`${BASE_URL}/teams?search=${encodeURIComponent(cleanName)}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': API_KEY,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();

      // Check if we found a team
      if (json.response && json.response.length > 0) {
        const team = json.response[0].team;
        
        const data: TeamData = {
          logo: team.logo,
          country: team.country
        };

        // Save to cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (e) {
          // Storage might be full
        }

        return data;
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
    return null;
  });
};
