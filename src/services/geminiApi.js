import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateSEOSuggestions = async (videoTitle, description, tags, category) => {
  console.log('=== SEO Generation Started ===');

  // Support both old signature and new object-based signature
  let ctx;
  if (typeof videoTitle === 'object' && videoTitle !== null) {
    ctx = videoTitle;
  } else {
    ctx = {
      title: videoTitle,
      description,
      tags,
      category,
      stats: {},
      channel: {},
      video: {}
    };
  }

  console.log('Video Title:', ctx.title);
  console.log('API Key exists:', !!GEMINI_API_KEY);
  
  // Always have fallback ready
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key missing, using fallback');
    return createFallbackSuggestions(ctx);
  }
  
  // Prefer free-friendly models first, then fall back
  const MODEL_CANDIDATES = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro',
    'gemini-1.0-pro-001',
    'gemini-pro'
  ];

  try {
    const prompt = `
You are an expert YouTube SEO specialist with 10+ years of experience in ranking algorithms, CTR psychology, and viral content dynamics.

IMPORTANT: Take your time to thoroughly analyze ALL aspects of this video. Quality is more important than speed.

Perform DEEP ANALYSIS on:

Title: ${ctx.title}
Description: ${ctx.description?.substring(0, 1000) || 'No description'}
Tags: ${ctx.tags?.join(', ') || 'No tags'}
Category: ${ctx.category || 'General'}
Channel: ${ctx.channel?.title || 'Unknown'} (${ctx.channel?.country || 'Unknown'})
Stats: views=${ctx.stats?.views || 'N/A'}, likes=${ctx.stats?.likes || 'N/A'}, comments=${ctx.stats?.comments || 'N/A'}, engagementRate=${ctx.stats?.engagementRate || 'N/A'}
Video: duration=${ctx.video?.duration || 'N/A'}, publishedAt=${ctx.video?.publishedAt || 'N/A'}, language=${ctx.video?.language || 'N/A'}

Your goal:
- Maximize click-through rate (CTR) with curiosity-driven but accurate title
- Improve search ranking with keyword-rich description and tags
- Boost engagement and watch time with actionable tips
- Ensure everything matches the actual content and audience intent

Provide:
1) Optimized Title (45-60 chars, no emojis, high CTR, relevant, unique)
2) SEO Description (200-300 words, strong hook first 150 chars, CTAs, related keywords)
3) Best Tags (25-35 search-optimized tags, mix of head/long-tail, no '#')
4) Trending Hashtags (8-12, relevant and viral-ready)
5) SEO Score (1-100 considering title, desc, tags, stats, engagement)
6) Improvement Tips (5-8 specific, actionable, prioritized)

Output JSON only, no extra text:
{
  "optimizedTitle": "string",
  "seoDescription": "string",
  "bestTags": ["tag1", "tag2", ...],
  "trendingHashtags": ["#hashtag1", "#hashtag2", ...],
  "seoScore": number,
  "improvementTips": ["tip1", "tip2", ...]
}`;

    console.log('Sending request to Gemini AI...');

    // Helper to try a model name with extended timeout (60 seconds for quality)
    const tryModel = async (modelName) => {
      console.log('Trying Gemini model:', modelName);
      const model = genAI.getGenerativeModel({ model: modelName });

      // Extended timeout: 60 seconds to ensure quality SEO generation
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout - taking longer for quality')), 60000)
      );

      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const response = await result.response;
      const text = response.text();
      return text;
    };

    let text = null;
    let lastErr = null;
    for (const m of MODEL_CANDIDATES) {
      try {
        text = await tryModel(m);
        console.log('Model succeeded:', m);
        break;
      } catch (err) {
        lastErr = err;
        console.warn('Model failed:', m, String(err));
        continue;
      }
    }

    if (!text) {
      throw lastErr || new Error('All Gemini models failed');
    }

    console.log('Raw Gemini Response received');
    // Parse JSON from response
    const jsonMatch = text && typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
    if (jsonMatch) {
      console.log('JSON found in response');
      const data = JSON.parse(jsonMatch[0]);
      console.log('Parsed SEO Suggestions:', data);
      return data;
    }

    console.warn('No JSON found in Gemini response');
    // Try to create fallback suggestions
    return createFallbackSuggestions(ctx);
  } catch (error) {
    console.error('Gemini SEO Suggestion Error:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
    // Return fallback suggestions on error
    return createFallbackSuggestions(ctx);
  }
};

// Fallback function to generate advanced SEO suggestions
const createFallbackSuggestions = (input) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('COMPREHENSIVE DEEP ANALYSIS - Quality Over Speed');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Analyzing all aspects: keywords, engagement, trends, competition...');
  
  // Simulate thorough analysis time
  const analysisStartTime = Date.now();

  // Support both object and positional inputs
  let videoTitle, description, tags, category, stats, channel, video;
  if (typeof input === 'object' && input !== null) {
    videoTitle = input.title || '';
    description = input.description || '';
    tags = input.tags || [];
    category = input.category || 'general';
    stats = input.stats || {};
    channel = input.channel || {};
    video = input.video || {};
  } else {
    videoTitle = input || '';
    description = arguments[1] || '';
    tags = arguments[2] || [];
    category = 'general';
    stats = {};
    channel = {};
    video = {};
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DEEP CONTENT ANALYSIS STARTED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Analyze video title deeply
  const titleWords = videoTitle.split(' ').filter(word => word.length > 2);
  const descWords = description ? description.toLowerCase().split(/\s+/).filter(w => w.length > 4) : [];
  
  // Extract and analyze keywords
  const allWords = [...titleWords, ...descWords.slice(0, 50)];
  const wordFrequency = {};
  allWords.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3) {
      wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
    }
  });
  
  // Get most frequent keywords (excluding common words)
  const stopWords = ['this', 'that', 'with', 'from', 'have', 'will', 'your', 'about', 'them', 'their', 'what', 'when', 'where', 'which'];
  const topKeywords = Object.entries(wordFrequency)
    .filter(([word]) => !stopWords.includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  console.log('Top Keywords Detected:', topKeywords);
  console.log('Video Stats:', stats);
  console.log('Channel Country:', channel?.country);
  
  // Create contentLower first (needed for multiple analyses)
  const contentLower = (videoTitle + ' ' + description).toLowerCase();
  
  // Extract main topic and keywords
  const powerWords = ['ultimate', 'complete', 'best', 'top', 'secret', 'proven', 'easy', 'fast', 'new', 'free', 'pro', 'expert', 'master'];
  const mainTopic = titleWords.slice(0, 5).join(' ');
  const primaryKeyword = topKeywords[0] || titleWords.slice(0, 3).join(' ');
  const secondaryKeywords = topKeywords.slice(1, 5);
  
  // Analyze engagement metrics
  const viewCount = stats?.views || 0;
  const likeCount = stats?.likes || 0;
  const commentCount = stats?.comments || 0;
  const engagementRate = stats?.engagementRate || 0;
  
  // Determine viral potential
  const viralIndicators = {
    highEngagement: engagementRate > 5,
    trendingTopic: contentLower.includes('viral') || contentLower.includes('trending'),
    shortDuration: video?.duration && video.duration.includes('PT') && !video.duration.includes('H'),
    recentUpload: video?.publishedAt && (new Date() - new Date(video.publishedAt)) < 7 * 24 * 60 * 60 * 1000
  };
  
  const viralScore = Object.values(viralIndicators).filter(Boolean).length;
  console.log('Viral Potential Score:', viralScore + '/4');
  console.log('Engagement Rate:', engagementRate + '%');
  
  // Analyze video category from content with more depth
  const categories = {
    tutorial: ['how to', 'tutorial', 'guide', 'learn', 'easy', 'step by step', 'diy', 'make'],
    entertainment: ['funny', 'comedy', 'entertainment', 'fun', 'viral', 'trending', 'challenge', 'prank'],
    review: ['review', 'unboxing', 'comparison', 'vs', 'best', 'worth it', 'honest'],
    gaming: ['gameplay', 'gaming', 'game', 'playthrough', 'walkthrough', 'let\'s play', 'stream'],
    tech: ['tech', 'technology', 'smartphone', 'computer', 'software', 'app', 'gadget', 'device'],
    educational: ['education', 'study', 'class', 'lesson', 'course', 'explain', 'science', 'history'],
    lifestyle: ['vlog', 'daily', 'routine', 'lifestyle', 'travel', 'food', 'cooking'],
    business: ['business', 'money', 'earn', 'passive income', 'invest', 'entrepreneur']
  };
  
  let detectedCategory = 'general';
  let categoryConfidence = 0;
  
  for (const [cat, keywords] of Object.entries(categories)) {
    const matches = keywords.filter(kw => contentLower.includes(kw)).length;
    if (matches > categoryConfidence) {
      categoryConfidence = matches;
      detectedCategory = cat;
    }
  }
  
  console.log('Category Detected:', detectedCategory, '(confidence:', categoryConfidence + ')');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Generate highly engaging, click-worthy optimized title (45-60 chars)
  let optimizedTitle;
  const titleLength = videoTitle.length;
  
  // Extract key action words and main subject
  const actionWords = ['challenge', 'vs', 'secret', 'trick', 'hack', 'win', 'best', 'top', 'only', 'ultimate'];
  const hasAction = actionWords.some(word => contentLower.includes(word));
  
  // Category-specific title patterns for maximum audience engagement
  const titlePatterns = {
    gaming: [
      (topic) => `${topic} - INSANE Challenge Result`,
      (topic) => `${topic} | This Actually Works`,
      (topic) => `Pro ${topic} Strategy - Must Try`,
      (topic) => `${topic} GONE WRONG - Unbelievable`,
      (topic) => `${topic} - Everyone is Talking About This`,
      (topic) => `${topic} Hack That Changed Everything`,
      (topic) => `Watch Before Playing ${topic}`,
      (topic) => `${topic} - Winning Strategy Revealed`
    ],
    tutorial: [
      (topic) => `${topic} - Easy Way Everyone Missed`,
      (topic) => `${topic} in 5 Minutes - Actually Works`,
      (topic) => `Learn ${topic} - No Experience Needed`,
      (topic) => `${topic} - Simplest Method Ever`,
      (topic) => `${topic} Step by Step - Beginner Friendly`,
      (topic) => `${topic} - Secret Pros Don't Tell You`,
      (topic) => `Master ${topic} Without Struggling`,
      (topic) => `${topic} Made Simple - Try This Now`
    ],
    entertainment: [
      (topic) => `${topic} - You Have to See This`,
      (topic) => `${topic} That Broke the Internet`,
      (topic) => `Watch ${topic} Till the End`,
      (topic) => `${topic} - Can't Believe This Happened`,
      (topic) => `${topic} - Most Viral Moment Ever`,
      (topic) => `${topic} - Everyone Reacting to This`,
      (topic) => `${topic} - This Changes Everything`,
      (topic) => `${topic} - Internet is Going Crazy`
    ],
    review: [
      (topic) => `${topic} - Before You Buy This`,
      (topic) => `${topic} - Worth Your Money?`,
      (topic) => `${topic} - Shocking Truth Nobody Tells`,
      (topic) => `${topic} Review - My Honest Opinion`,
      (topic) => `${topic} - Best or Worst Purchase?`,
      (topic) => `${topic} - What They Don't Tell You`,
      (topic) => `${topic} After 30 Days - Real Results`,
      (topic) => `${topic} - Save Your Money Watch This`
    ],
    tech: [
      (topic) => `${topic} - Features You Don't Know`,
      (topic) => `${topic} - This Will Blow Your Mind`,
      (topic) => `${topic} Deep Dive - Worth the Hype?`,
      (topic) => `${topic} - Hidden Features Revealed`,
      (topic) => `${topic} - Better Than Expected`,
      (topic) => `${topic} - Full Review & Real Test`,
      (topic) => `${topic} - Should You Upgrade?`,
      (topic) => `${topic} vs Competition - Clear Winner`
    ]
  };
  
  // Select pattern based on detected category
  const patterns = titlePatterns[detectedCategory] || titlePatterns.tutorial;
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Keep original if it's already good (has action word and right length)
  if (hasAction && titleLength >= 40 && titleLength <= 60) {
    // Just optimize the existing title
    optimizedTitle = videoTitle
      .replace(/🤯|🔥|😱|💯|⚡|✅|❌|👍|💪/g, '') // Remove emojis
      .trim();
  } else if (titleLength > 60) {
    // Create engaging short version
    const coreTopic = titleWords.slice(0, 5).join(' ');
    optimizedTitle = selectedPattern(coreTopic);
  } else if (titleLength < 40) {
    // Expand with engaging pattern
    optimizedTitle = selectedPattern(mainTopic);
  } else {
    // Use pattern with main topic
    optimizedTitle = selectedPattern(mainTopic);
  }
  
  // Add power word if missing
  const hasPowerWord = powerWords.some(pw => optimizedTitle.toLowerCase().includes(pw));
  if (!hasPowerWord && optimizedTitle.length < 50) {
    const powerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    optimizedTitle = `${powerWord.charAt(0).toUpperCase() + powerWord.slice(1)} ${optimizedTitle}`;
  }
  
  // Ensure title is between 45-60 characters for best SEO
  if (optimizedTitle.length > 60) {
    optimizedTitle = optimizedTitle.substring(0, 57) + '...';
  } else if (optimizedTitle.length < 45) {
    // Add year for freshness signal
    optimizedTitle = `${optimizedTitle} 2025`;
  }
  
  // Generate viral-optimized tags (25-35 tags)
  const baseTags = tags || [];
  const categoryTags = {
    tutorial: ['how to', 'tutorial', 'step by step', 'guide', 'learn', 'beginner friendly', 'easy tutorial'],
    entertainment: ['funny', 'viral video', 'trending', 'entertainment', 'must watch', 'amazing'],
    review: ['review', 'honest review', 'detailed review', 'worth it', 'recommendation', 'comparison'],
    gaming: ['gaming', 'gameplay', 'game review', 'lets play', 'game tutorial', 'pro tips'],
    tech: ['technology', 'tech review', 'latest tech', 'gadgets', 'smartphone', 'tech news'],
    educational: ['educational', 'learning', 'explained', 'knowledge', 'informative', 'lesson']
  };
  
  const specificTags = categoryTags[detectedCategory] || ['tips', 'guide', 'helpful'];
  const viralTags = ['viral', 'trending', 'popular', '2024', '2025', 'new', 'latest', 'best'];
  const searchOptimizedTags = [
    primaryKeyword,
    ...titleWords.filter(w => w.length > 3).slice(0, 8),
    ...specificTags,
    ...viralTags,
    `${mainTopic} tutorial`,
    `${mainTopic} guide`,
    `best ${mainTopic}`,
    `how to ${mainTopic}`,
    ...descWords.slice(0, 5)
  ];
  
  const bestTags = [...new Set([...baseTags, ...searchOptimizedTags])]
    .filter(tag => tag && tag.length > 1)
    .slice(0, 35);
  
  // Generate viral hashtags (8-12 hashtags)
  const cleanWord = (word) => word.replace(/[^a-zA-Z0-9]/g, '');
  const categoryHashtags = {
    tutorial: ['#HowTo', '#Tutorial', '#LearnOnYouTube', '#Education'],
    entertainment: ['#Viral', '#Trending', '#MustWatch', '#Entertainment'],
    review: ['#Review', '#ProductReview', '#Honest', '#Recommendation'],
    gaming: ['#Gaming', '#Gamer', '#GamePlay', '#GamingCommunity'],
    tech: ['#Tech', '#Technology', '#TechReview', '#Gadgets'],
    educational: ['#Education', '#Learning', '#Knowledge', '#Study']
  };
  
  const specificHashtags = categoryHashtags[detectedCategory] || ['#Tips', '#Guide'];
  const mainHashtags = titleWords.slice(0, 4).map(w => `#${cleanWord(w)}`).filter(h => h.length > 2);
  const trendingHashtags = [
    ...specificHashtags,
    ...mainHashtags,
    '#YouTube',
    '#Viral',
    '#Trending2025',
    '#MustWatch',
    `#${cleanWord(primaryKeyword)}`
  ].filter(h => h.length > 2).slice(0, 12);
  
  // Generate beautifully structured SEO-optimized description (200-300 words)
  
  // Hook (First 150 characters - most important for search)
  const hookIntros = [
    `${primaryKeyword} complete guide | Everything you need to know about ${mainTopic}`,
    `Master ${primaryKeyword} with this proven step-by-step tutorial`,
    `Best ${primaryKeyword} tips and tricks | ${mainTopic} explained`,
    `${mainTopic} tutorial for beginners and pros | Learn ${primaryKeyword} fast`
  ];
  const hook = hookIntros[Math.floor(Math.random() * hookIntros.length)];
  
  // Main content with keywords naturally integrated
  const mainContent = `In this ${detectedCategory === 'gaming' ? 'gameplay' : detectedCategory} video, ` +
    `we cover ${primaryKeyword} in detail. Whether you're searching for ${mainTopic} tips, ` +
    `${primaryKeyword} tutorial, or ${mainTopic} guide, this video has everything you need.`;
  
  // Key topics with keywords
  const keyTopics = [
    `${primaryKeyword} basics and fundamentals`,
    `Step-by-step ${mainTopic} walkthrough`,
    `Pro ${primaryKeyword} techniques and strategies`,
    `Common ${mainTopic} mistakes to avoid`,
    `Advanced ${primaryKeyword} tips for better results`
  ];
  
  // Benefits section with keywords
  const benefits = [
    `Perfect for ${primaryKeyword} beginners`,
    `${mainTopic} explained in simple terms`,
    `Proven ${primaryKeyword} methods that work`,
    `Save time learning ${mainTopic}`,
    `Get ${primaryKeyword} results quickly`
  ];
  
  // Strong CTAs
  const ctas = [
    'LIKE this video if it helped you',
    'SUBSCRIBE for more tutorials',
    'COMMENT your questions below',
    'SHARE with friends who need this',
    'TURN ON notifications for updates'
  ];
  
  // Build perfectly structured description with proper formatting
  const seoDescription = 
    `${hook}\n\n` +
    `${mainContent}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `WHAT YOU'LL LEARN:\n` +
    keyTopics.map((t, i) => `${i + 1}. ${t}`).join('\n') + '\n\n' +
    `WHY WATCH THIS:\n` +
    benefits.map(b => `✓ ${b}`).join('\n') + '\n\n' +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `TIMESTAMPS:\n` +
    `0:00 - Introduction to ${primaryKeyword}\n` +
    `0:45 - ${mainTopic} getting started\n` +
    `2:30 - Main ${primaryKeyword} content\n` +
    `5:15 - Advanced ${mainTopic} tips\n` +
    `7:30 - ${primaryKeyword} conclusion\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `ENGAGE WITH US:\n` +
    ctas.map(c => `► ${c}`).join('\n') + '\n\n' +
    `${trendingHashtags.join(' ')}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `CONNECT WITH US:\n` +
    `► Website: https://yourwebsite.com\n` +
    `► Facebook: https://facebook.com/yourpage\n` +
    `► Instagram: https://instagram.com/yourprofile\n` +
    `► Twitter: https://twitter.com/yourhandle\n` +
    `► TikTok: https://tiktok.com/@yourhandle\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `KEYWORDS: ${bestTags.slice(0, 15).join(' | ')}\n\n` +
    `Related: ${primaryKeyword}, ${mainTopic} tutorial, ${primaryKeyword} guide, ` +
    `${mainTopic} tips, ${primaryKeyword} beginners, ${mainTopic} explained, ` +
    `${primaryKeyword} step by step, ${mainTopic} 2025\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `COPYRIGHT DISCLAIMER:\n` +
    `This video and all content on this channel are protected by copyright law.\n` +
    `Unauthorized reproduction, distribution, or use of this content is prohibited.\n` +
    `Fair use allowed for educational and commentary purposes only.\n\n` +
    `All rights reserved © ${new Date().getFullYear()}\n` +
    `Content by: [Your Channel Name]\n` +
    `For business inquiries: contact@yourwebsite.com`;
  
  // Generate category-specific improvement tips
  const categoryTips = {
    tutorial: [
      'Create step-by-step thumbnail showing the process or result',
      'Add chapter markers for each major step in the tutorial',
      'Include "How to" at the beginning of your title for better search',
      'Show before/after results in thumbnail to increase CTR',
      'Create a pinned comment with quick summary for returning viewers'
    ],
    entertainment: [
      'Use bright colors and expressive faces in thumbnail',
      'Create curiosity gap in title without being clickbait',
      'Hook viewers in first 5 seconds with your best moment',
      'Add trending sound or music to boost algorithm favor',
      'Collaborate with other creators for cross-promotion'
    ],
    review: [
      'Show the product clearly in thumbnail with rating stars',
      'Include price and value proposition in description',
      'Add comparison timestamps if reviewing multiple items',
      'Use honest opinion keywords like "Honest", "Real", "Unbiased"',
      'Link to product with affiliate disclosure for monetization'
    ],
    gaming: [
      'Feature epic gameplay moment in thumbnail',
      'Add game name and level/chapter in title',
      'Include difficulty level to target right audience',
      'Add timestamps for different gameplay segments',
      'Use gaming hashtags like #Gaming #Gamer #GamePlay'
    ],
    tech: [
      'Show device/tech clearly with specs overlay in thumbnail',
      'Include model numbers and year in title for search',
      'Compare with competitors to rank in comparison searches',
      'Add spec sheet in description for SEO keywords',
      'Create "vs" content for higher search volume'
    ],
    educational: [
      'Design clean educational thumbnail with topic title',
      'Structure content with clear learning outcomes',
      'Add quiz or practice questions in pinned comment',
      'Include related course or playlist links',
      'Use education hashtags like #Learn #Education #Study'
    ]
  };
  
  const specificTips = categoryTips[detectedCategory] || [
    'Optimize thumbnail with high contrast colors',
    'Add relevant keywords naturally in title',
    'Structure content with clear sections',
    'Engage with audience in comments',
    'Promote video on social media platforms'
  ];
  
  const universalTips = [
    'Upload consistently on the same days/times to build audience habits',
    'First 24-48 hours are crucial - promote heavily during this window',
    'Create playlists to increase session watch time',
    'Add cards at 50% mark and end screens in last 20 seconds',
    'Analyze retention graph and cut content where viewers drop off',
    'Reply to every comment in first 2 hours to boost engagement signals',
    'Use community tab to tease upcoming content and build anticipation',
    'Create custom thumbnails that work at small sizes (mobile view)'
  ];
  
  const improvementTips = [
    ...specificTips,
    ...universalTips.slice(0, 3)
  ];
  
  // Calculate advanced SEO score with detailed analysis
  let seoScore = 40; // Base score
  
  // Title optimization (max 20 points)
  if (videoTitle.length >= 40 && videoTitle.length <= 60) seoScore += 10;
  if (videoTitle.split(' ').length >= 5) seoScore += 5;
  if (powerWords.some(pw => contentLower.includes(pw))) seoScore += 5;
  
  // Description optimization (max 15 points)
  if (description && description.length > 200) seoScore += 10;
  if (description && description.length > 500) seoScore += 5;
  
  // Tags optimization (max 15 points)
  if (tags && tags.length > 10) seoScore += 8;
  if (tags && tags.length > 20) seoScore += 7;
  
  // Content quality indicators (max 10 points)
  if (contentLower.match(/how to|tutorial|guide|learn/)) seoScore += 5;
  if (titleWords.length >= 6) seoScore += 5;
  
  // Analysis completion report
  const analysisTime = ((Date.now() - analysisStartTime) / 1000).toFixed(2);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ANALYSIS COMPLETE');
  console.log('Time taken:', analysisTime + 's');
  console.log('Generated:');
  console.log('- Title:', optimizedTitle.length, 'chars');
  console.log('- Description:', seoDescription.length, 'chars');
  console.log('- Tags:', bestTags.length, 'items');
  console.log('- Hashtags:', trendingHashtags.length, 'items');
  console.log('- Tips:', improvementTips.length, 'items');
  console.log('- SEO Score:', seoScore + '/100');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return {
    optimizedTitle,
    seoDescription,
    bestTags,
    trendingHashtags,
    seoScore: Math.min(seoScore, 95),
    improvementTips
  };
};

export const calculateVideoIncome = async (viewCount, country, category) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are a YouTube monetization expert. Calculate the estimated income for a YouTube video with the following details:

- Total Views: ${viewCount}
- Channel Country: ${country || 'Unknown'}
- Video Category: ${category || 'General'}

Consider these factors:
1. YouTube CPM rates vary by country (US: $3-$10, India: $0.5-$2, Europe: $2-$8, etc.)
2. Average RPM (Revenue Per Mille) is typically 50-70% of CPM
3. Monetization eligibility and ad placement
4. Category affects CPM (Finance/Tech = higher, Entertainment = lower)
5. Audience demographics and engagement

Provide:
1. Minimum estimated income (USD)
2. Maximum estimated income (USD)
3. Most likely income (USD)

Format your response as JSON:
{
  "min": "number",
  "max": "number",
  "likely": "number"
}

Only return the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        min: parseFloat(data.min),
        max: parseFloat(data.max),
        likely: parseFloat(data.likely)
      };
    }
    
    // Fallback calculation
    return null;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
};
