// Section-specific SEO regeneration functions

export const regenerateTitle = (videoContext, currentSuggestions) => {
  const titleWords = videoContext.title.split(' ').filter(word => word.length > 2);
  const mainTopic = titleWords.slice(0, 4).join(' ');
  
  const titlePatterns = [
    `${mainTopic} - Complete Guide`,
    `${mainTopic} | Must Watch`,
    `${mainTopic} - Pro Tips Inside`,
    `Master ${mainTopic} Fast`,
    `${mainTopic} - Game Changer`,
    `${mainTopic} Explained Simply`,
    `Best ${mainTopic} Tutorial`,
    `${mainTopic} - Step by Step`
  ];
  
  const randomIndex = Math.floor(Math.random() * titlePatterns.length);
  let newTitle = titlePatterns[randomIndex];
  
  // Ensure 45-60 characters
  if (newTitle.length > 60) {
    newTitle = newTitle.substring(0, 57) + '...';
  } else if (newTitle.length < 45) {
    newTitle = `${newTitle} 2025`;
  }
  
  return newTitle;
};

export const regenerateDescription = (videoContext, currentSuggestions) => {
  const titleWords = videoContext.title.split(' ').filter(word => word.length > 2);
  const mainTopic = titleWords.slice(0, 4).join(' ');
  const primaryKeyword = titleWords.slice(0, 3).join(' ');
  
  const hooks = [
    `Complete ${primaryKeyword} guide for beginners and experts`,
    `Everything about ${mainTopic} explained step by step`,
    `${primaryKeyword} tutorial - from basics to advanced`,
    `Learn ${mainTopic} the easy and effective way`
  ];
  
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  
  const newDescription = 
    `${hook}\n\n` +
    `This comprehensive video covers ${primaryKeyword} in detail. Perfect for anyone looking to learn ${mainTopic}.\n\n` +
    `WHAT YOU'LL LEARN:\n` +
    `1. ${primaryKeyword} fundamentals\n` +
    `2. Step-by-step ${mainTopic} process\n` +
    `3. Pro tips and techniques\n` +
    `4. Common mistakes to avoid\n` +
    `5. Advanced strategies\n\n` +
    `WHY WATCH THIS:\n` +
    `✓ Beginner friendly content\n` +
    `✓ Clear explanations\n` +
    `✓ Proven methods\n` +
    `✓ Time-saving tips\n` +
    `✓ Real results\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `TIMESTAMPS:\n` +
    `0:00 - Introduction\n` +
    `1:00 - Getting Started\n` +
    `3:00 - Main Content\n` +
    `6:00 - Advanced Tips\n` +
    `8:00 - Conclusion\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `ENGAGE:\n` +
    `► LIKE if helpful\n` +
    `► SUBSCRIBE for more\n` +
    `► COMMENT your thoughts\n` +
    `► SHARE with friends\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `CONNECT:\n` +
    `► Website: https://yourwebsite.com\n` +
    `► Social Media: [Add links]\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `COPYRIGHT DISCLAIMER:\n` +
    `All content protected by copyright law.\n` +
    `Unauthorized use prohibited.\n` +
    `© ${new Date().getFullYear()} - All rights reserved`;
  
  return newDescription;
};

export const regenerateTags = (videoContext, currentSuggestions) => {
  const titleWords = videoContext.title.split(' ').filter(word => word.length > 2);
  const mainTopic = titleWords.slice(0, 4).join(' ');
  
  const baseTags = [
    ...titleWords.slice(0, 8),
    `${mainTopic} tutorial`,
    `${mainTopic} guide`,
    `${mainTopic} tips`,
    `${mainTopic} 2025`,
    'how to',
    'step by step',
    'beginner friendly',
    'tutorial',
    'guide',
    'tips and tricks',
    'easy method',
    'fast results',
    'proven techniques',
    'best practices',
    'complete course',
    'full tutorial',
    'learn online',
    'free tutorial',
    'quick guide',
    'detailed explanation'
  ];
  
  // Add some random variety
  const extraTags = [
    'viral content',
    'trending now',
    'must watch',
    'game changer',
    'life hack',
    'pro tips',
    'expert advice',
    'beginner to pro'
  ];
  
  const randomExtras = extraTags.sort(() => Math.random() - 0.5).slice(0, 5);
  
  return [...new Set([...baseTags, ...randomExtras])].slice(0, 35);
};

export const regenerateHashtags = (videoContext, currentSuggestions) => {
  const titleWords = videoContext.title.split(' ').filter(word => word.length > 2);
  
  const baseHashtags = titleWords
    .slice(0, 4)
    .map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`)
    .filter(h => h.length > 2);
  
  const trendingHashtags = [
    '#Viral',
    '#Trending',
    '#MustWatch',
    '#Tutorial',
    '#HowTo',
    '#Learn',
    '#Tips',
    '#Guide',
    '#2025',
    '#YouTube',
    '#Educational',
    '#StepByStep'
  ];
  
  const randomTrending = trendingHashtags.sort(() => Math.random() - 0.5).slice(0, 6);
  
  return [...new Set([...baseHashtags, ...randomTrending])].slice(0, 12);
};
