import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Extract video ID from YouTube URL
export const extractVideoId = (input) => {
  // If it's already a video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Get video details using YouTube Data API v3
export const getVideoDetails = async (videoId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,statistics,contentDetails,status',
          id: videoId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    throw new Error('Video not found');
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw error;
  }
};


// Search videos by title
export const searchVideosByTitle = async (query) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 10,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    return response.data.items;
  } catch (error) {
    console.error('Search Error:', error);
    throw error;
  }
};

// Format duration from ISO 8601 to readable format
export const formatDuration = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Format large numbers
export const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num?.toString() || '0';
};

// Calculate engagement rate
export const calculateEngagementRate = (stats) => {
  const views = parseInt(stats.viewCount) || 0;
  const likes = parseInt(stats.likeCount) || 0;
  const comments = parseInt(stats.commentCount) || 0;
  
  if (views === 0) return 0;
  
  return (((likes + comments) / views) * 100).toFixed(2);
};

// YouTube CPM rates by country (per 1000 views)
const countryRates = {
  // High CPM Countries (Tier 1)
  'US': { min: 4, max: 12, avg: 8 },
  'CA': { min: 3.5, max: 10, avg: 6.5 },
  'GB': { min: 3, max: 10, avg: 6 },
  'AU': { min: 3, max: 9, avg: 6 },
  'DE': { min: 2.5, max: 8, avg: 5 },
  'FR': { min: 2, max: 7, avg: 4.5 },
  'NL': { min: 2.5, max: 7, avg: 4.5 },
  'SE': { min: 2.5, max: 8, avg: 5 },
  'NO': { min: 3, max: 9, avg: 6 },
  'DK': { min: 2.5, max: 8, avg: 5 },
  'CH': { min: 3, max: 10, avg: 6.5 },
  
  // Medium-High CPM (Tier 2)
  'NZ': { min: 2, max: 6, avg: 4 },
  'IE': { min: 2, max: 6, avg: 4 },
  'IT': { min: 1.5, max: 5, avg: 3 },
  'ES': { min: 1.5, max: 5, avg: 3 },
  'FI': { min: 2, max: 6, avg: 4 },
  'BE': { min: 1.5, max: 5, avg: 3 },
  'AT': { min: 2, max: 6, avg: 4 },
  'JP': { min: 1.5, max: 5, avg: 3 },
  'KR': { min: 1.5, max: 5, avg: 3 },
  'SG': { min: 2, max: 6, avg: 4 },
  'AE': { min: 2, max: 7, avg: 4.5 },
  'SA': { min: 1.5, max: 5, avg: 3 },
  'IL': { min: 1.5, max: 5, avg: 3 },
  
  // Medium CPM (Tier 3)
  'BR': { min: 1, max: 3.5, avg: 2 },
  'MX': { min: 0.8, max: 3, avg: 1.5 },
  'AR': { min: 0.8, max: 3, avg: 1.5 },
  'CL': { min: 1, max: 3, avg: 2 },
  'CO': { min: 0.8, max: 2.5, avg: 1.5 },
  'PE': { min: 0.8, max: 2.5, avg: 1.5 },
  'PL': { min: 1, max: 3.5, avg: 2 },
  'RU': { min: 0.5, max: 2, avg: 1 },
  'TR': { min: 0.8, max: 2.5, avg: 1.5 },
  'GR': { min: 1, max: 3, avg: 2 },
  'PT': { min: 1, max: 3, avg: 2 },
  'CZ': { min: 1, max: 3, avg: 2 },
  'HU': { min: 0.8, max: 2.5, avg: 1.5 },
  'RO': { min: 0.8, max: 2.5, avg: 1.5 },
  'UA': { min: 0.5, max: 2, avg: 1 },
  'ZA': { min: 1, max: 3.5, avg: 2 },
  'MY': { min: 1, max: 3, avg: 2 },
  'TH': { min: 0.8, max: 2.5, avg: 1.5 },
  
  // Low CPM (Tier 4)
  'IN': { min: 0.3, max: 1.5, avg: 0.8 },
  'BD': { min: 0.2, max: 1, avg: 0.5 },
  'PK': { min: 0.3, max: 1.2, avg: 0.6 },
  'PH': { min: 0.5, max: 2, avg: 1 },
  'ID': { min: 0.5, max: 2, avg: 1 },
  'VN': { min: 0.4, max: 1.5, avg: 0.8 },
  'EG': { min: 0.3, max: 1.5, avg: 0.8 },
  'NG': { min: 0.5, max: 2, avg: 1 },
  'KE': { min: 0.5, max: 2, avg: 1 },
  'CN': { min: 0.8, max: 3, avg: 1.5 },
  
  // Default for unknown countries
  'DEFAULT': { min: 0.5, max: 3, avg: 1.5 }
};

// Calculate YouTube video income based on country and views
export const calculateYouTubeIncome = (viewCount, countryCode) => {
  const views = parseInt(viewCount) || 0;
  if (views === 0) return { min: 0, max: 0, likely: 0 };
  
  // Get CPM rates for country
  const rates = countryRates[countryCode] || countryRates['DEFAULT'];
  
  // Calculate RPM (Revenue Per Mille) - typically 55% of CPM (YouTube takes 45%)
  const youtubeShare = 0.55;
  
  // Calculate income (views / 1000 * CPM * YouTube share)
  const minIncome = (views / 1000) * rates.min * youtubeShare;
  const maxIncome = (views / 1000) * rates.max * youtubeShare;
  const likelyIncome = (views / 1000) * rates.avg * youtubeShare;
  
  return {
    min: Math.round(minIncome * 100) / 100,
    max: Math.round(maxIncome * 100) / 100,
    likely: Math.round(likelyIncome * 100) / 100,
    cpm: rates.avg
  };
};

// Get channel details including subscriber count and country
export const getChannelDetails = async (channelId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`,
      {
        params: {
          part: 'statistics,snippet',
          id: channelId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      return {
        statistics: channel.statistics,
        country: channel.snippet.country || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Channel API Error:', error);
    return null;
  }
};
