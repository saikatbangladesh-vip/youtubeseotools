import { useState } from 'react';
import './App.css';
import {
  extractVideoId,
  getVideoDetails,
  searchVideosByTitle,
  formatDuration,
  formatNumber,
  calculateEngagementRate,
  getChannelDetails,
  calculateYouTubeIncome,
} from './services/youtubeApi';
import { generateSEOSuggestions } from './services/geminiApi';
import { 
  regenerateTitle, 
  regenerateDescription, 
  regenerateTags, 
  regenerateHashtags 
} from './services/seoRegenerators';
import { 
  IoEyeOutline,
  IoThumbsUpOutline, 
  IoChatbubbleOutline, 
  IoStatsChartOutline,
  IoTimeOutline,
  IoMusicalNoteOutline,
  IoDocumentTextOutline,
  IoPricetagsOutline,
  IoImageOutline,
  IoSearchOutline,
  IoLinkOutline,
  IoFlashOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoTvOutline,
  IoDownloadOutline,
  IoRefreshOutline
} from 'react-icons/io5';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [searchType, setSearchType] = useState('url'); // 'url' or 'title'
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [copiedSection, setCopiedSection] = useState('');
  const [channelStats, setChannelStats] = useState(null);
  const [estimatedIncome, setEstimatedIncome] = useState(null);
  const [loadingIncome, setLoadingIncome] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState(null);
  const [loadingSEO, setLoadingSEO] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [videoContext, setVideoContext] = useState(null);
  const [refreshingInfo, setRefreshingInfo] = useState(false);
  const [refreshingMediaInfo, setRefreshingMediaInfo] = useState(false);

  const handleAnalyze = async () => {
    setError('');
    setVideoData(null);
    setSearchResults([]);
    setChannelStats(null);
    setEstimatedIncome(null);
    setLoadingIncome(false);
    setSeoSuggestions(null);
    setLoadingSEO(false);

    if (!inputValue.trim()) {
      setError('Please enter a YouTube link or title');
      return;
    }

    setLoading(true);

    try {
      if (searchType === 'url') {
        const videoId = extractVideoId(inputValue);
        
        if (!videoId) {
          setError('Please enter a valid YouTube link or video ID');
          setLoading(false);
          return;
        }

        const data = await getVideoDetails(videoId);
        setVideoData(data);
        
        // Fetch channel subscriber count and calculate income
        if (data.snippet.channelId) {
          const channelData = await getChannelDetails(data.snippet.channelId);
          setChannelStats(channelData);
          
          // Calculate income based on country and views
          setLoadingIncome(true);
          const income = calculateYouTubeIncome(
            data.statistics.viewCount,
            channelData?.country
          );
          setEstimatedIncome(income);
          setLoadingIncome(false);
          
          // Generate SEO suggestions using AI
          setLoadingSEO(true);
          try {
            const engagementRate = calculateEngagementRate(
              Number(data.statistics.likeCount || 0),
              Number(data.statistics.commentCount || 0),
              Number(data.statistics.viewCount || 0)
            );

            const context = {
              title: data.snippet.title,
              description: data.snippet.description,
              tags: data.snippet.tags,
              category: data.snippet.categoryId,
              stats: {
                views: Number(data.statistics.viewCount || 0),
                likes: Number(data.statistics.likeCount || 0),
                comments: Number(data.statistics.commentCount || 0),
                engagementRate
              },
              channel: {
                title: data.snippet.channelTitle,
                country: channelData?.country
              },
              video: {
                duration: data.contentDetails?.duration,
                publishedAt: data.snippet.publishedAt,
                language: data.snippet.defaultLanguage || data.snippet.defaultAudioLanguage || 'en'
              }
            };
            
            setVideoContext(context);
            const suggestions = await generateSEOSuggestions(context);

            console.log('SEO Suggestions received:', suggestions);
            setSeoSuggestions(suggestions);
            setLoadingSEO(false);
          } catch (error) {
            console.error('SEO generation error:', error);
            setLoadingSEO(false);
            setSeoSuggestions(null);
          }
        }
      } else {
        const results = await searchVideosByTitle(inputValue);
        
        if (results.length === 0) {
          setError('No videos found');
          setLoading(false);
          return;
        }

        setSearchResults(results);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    });
  };

  const handleRefreshVideoInfo = async () => {
    if (!videoData) return;
    
    setRefreshingInfo(true);
    try {
      // Re-fetch only video details to get latest stats
      const videoId = extractVideoId(inputValue);
      if (videoId) {
        const freshData = await getVideoDetails(videoId);
        
        // Update only Video Info related data
        setVideoData(prevData => ({
          ...prevData,
          snippet: {
            ...prevData.snippet,
            publishedAt: freshData.snippet.publishedAt
          },
          contentDetails: {
            ...prevData.contentDetails,
            duration: freshData.contentDetails.duration
          },
          status: freshData.status
        }));
        
        // Refresh income calculation
        if (freshData.snippet.channelId && channelStats) {
          const freshIncome = calculateYouTubeIncome(
            freshData.statistics.viewCount,
            channelStats?.country
          );
          setEstimatedIncome(freshIncome);
        }
      }
    } catch (error) {
      console.error('Video Info refresh error:', error);
    } finally {
      setRefreshingInfo(false);
    }
  };

  const handleRefreshMediaInfo = async () => {
    if (!videoData) return;
    
    setRefreshingMediaInfo(true);
    try {
      // Re-fetch only video details to get latest media info
      const videoId = extractVideoId(inputValue);
      if (videoId) {
        const freshData = await getVideoDetails(videoId);
        
        // Update only Media Info related data
        setVideoData(prevData => ({
          ...prevData,
          contentDetails: {
            ...prevData.contentDetails,
            definition: freshData.contentDetails.definition,
            caption: freshData.contentDetails.caption,
            licensedContent: freshData.contentDetails.licensedContent,
            contentRating: freshData.contentDetails.contentRating
          }
        }));
      }
    } catch (error) {
      console.error('Media Info refresh error:', error);
    } finally {
      setRefreshingMediaInfo(false);
    }
  };

  const handleRegenerate = async (section) => {
    if (!videoContext || !seoSuggestions) return;
    
    setRegeneratingSection(section);
    
    // Simulate a brief loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const updatedSuggestions = { ...seoSuggestions };
      
      switch(section) {
        case 'title':
          updatedSuggestions.optimizedTitle = regenerateTitle(videoContext, seoSuggestions);
          console.log('Title regenerated:', updatedSuggestions.optimizedTitle);
          break;
        case 'description':
          updatedSuggestions.seoDescription = regenerateDescription(videoContext, seoSuggestions);
          console.log('Description regenerated');
          break;
        case 'tags':
          updatedSuggestions.bestTags = regenerateTags(videoContext, seoSuggestions);
          console.log('Tags regenerated:', updatedSuggestions.bestTags.length);
          break;
        case 'hashtags':
          updatedSuggestions.trendingHashtags = regenerateHashtags(videoContext, seoSuggestions);
          console.log('Hashtags regenerated:', updatedSuggestions.trendingHashtags.length);
          break;
        default:
          break;
      }
      
      setSeoSuggestions(updatedSuggestions);
    } catch (error) {
      console.error('Regenerate error:', error);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const formatIncome = () => {
    if (loadingIncome) return 'Calculating...';
    if (!estimatedIncome) return 'N/A';
    
    // Get country's CPM rate
    const cpmRate = estimatedIncome.cpm || 'N/A';
    
    return `$${estimatedIncome.min.toLocaleString()} - $${estimatedIncome.max.toLocaleString()} (CPM: $${cpmRate})`;
  };

  const getUploadTime = (publishedAt) => {
    const date = new Date(publishedAt);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getCountryName = (countryCode) => {
    const countries = {
      'US': 'United States',
      'IN': 'India',
      'BD': 'Bangladesh',
      'GB': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'ES': 'Spain',
      'IT': 'Italy',
      'NL': 'Netherlands',
      'SE': 'Sweden',
      'NO': 'Norway',
      'DK': 'Denmark',
      'FI': 'Finland',
      'PL': 'Poland',
      'RU': 'Russia',
      'JP': 'Japan',
      'KR': 'South Korea',
      'CN': 'China',
      'TH': 'Thailand',
      'VN': 'Vietnam',
      'PH': 'Philippines',
      'ID': 'Indonesia',
      'MY': 'Malaysia',
      'SG': 'Singapore',
      'PK': 'Pakistan',
      'AE': 'United Arab Emirates',
      'SA': 'Saudi Arabia',
      'EG': 'Egypt',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'AR': 'Argentina',
      'CL': 'Chile',
      'CO': 'Colombia',
      'PE': 'Peru',
      'TR': 'Turkey',
      'GR': 'Greece',
      'PT': 'Portugal',
      'BE': 'Belgium',
      'CH': 'Switzerland',
      'AT': 'Austria',
      'IE': 'Ireland',
      'NZ': 'New Zealand',
      'IL': 'Israel',
      'UA': 'Ukraine',
      'RO': 'Romania',
      'CZ': 'Czech Republic',
      'HU': 'Hungary',
    };
    return countries[countryCode] || countryCode;
  };

  const handleDownloadThumbnail = async (url, videoTitle) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_thumbnail.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleSelectVideo = async (videoId) => {
    setLoading(true);
    setError('');
    setSearchResults([]);
    setChannelStats(null);
    setEstimatedIncome(null);
    setLoadingIncome(false);

    try {
      const data = await getVideoDetails(videoId);
      setVideoData(data);
      
      // Fetch channel subscriber count and calculate income
      if (data.snippet.channelId) {
        const channelData = await getChannelDetails(data.snippet.channelId);
        setChannelStats(channelData);
        
        // Calculate income based on country and views
        setLoadingIncome(true);
        const income = calculateYouTubeIncome(
          data.statistics.viewCount,
          channelData?.country
        );
        setEstimatedIncome(income);
        setLoadingIncome(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderVideoDetails = () => {
    if (!videoData) return null;

    const { snippet, statistics, contentDetails, status } = videoData;

    return (
      <div className="video-details">
        {/* Video Player */}
        <div className="video-player-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoData.id}`}
            title={snippet.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Video Info */}
        <div className="video-info">
          <h2 className="video-title">{snippet.title}</h2>
          <div className="channel-info">
            {channelStats && channelStats.country && (
              <p className="country-badge">
                {getCountryName(channelStats.country)}
              </p>
            )}
            <p className="channel-name">
              <IoTvOutline className="inline-icon" /> {snippet.channelTitle}
            </p>
            {channelStats && channelStats.statistics && channelStats.statistics.subscriberCount && (
              <p className="subscriber-count">
                {formatNumber(channelStats.statistics.subscriberCount)} subscribers
              </p>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><IoEyeOutline /></div>
            <div className="stat-value">{formatNumber(statistics.viewCount)}</div>
            <div className="stat-label">Views</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><IoThumbsUpOutline /></div>
            <div className="stat-value">{formatNumber(statistics.likeCount)}</div>
            <div className="stat-label">Likes</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><IoChatbubbleOutline /></div>
            <div className="stat-value">{formatNumber(statistics.commentCount)}</div>
            <div className="stat-label">Comments</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><IoStatsChartOutline /></div>
            <div className="stat-value">{calculateEngagementRate(statistics)}%</div>
            <div className="stat-label">Engagement</div>
          </div>
        </div>

        {/* Details Section */}
        <div className="details-stack">
          {/* Video Info */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoTimeOutline className="section-icon" /> Video Info</h3>
              <button
                className="regenerate-btn"
                onClick={handleRefreshVideoInfo}
                disabled={refreshingInfo}
              >
                {refreshingInfo ? <><div className="mini-spinner"></div> Refreshing</> : <><IoRefreshOutline /> Refresh</>}
              </button>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{formatDuration(contentDetails.duration)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Published:</span>
              <span className="detail-value">
                {new Date(snippet.publishedAt).toLocaleDateString('en-US')}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{status.privacyStatus === 'public' ? 'Public' : status.privacyStatus}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Upload Time:</span>
              <span className="detail-value">{getUploadTime(snippet.publishedAt)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Estimated Income:</span>
              <span className="detail-value income-value">{formatIncome()}</span>
            </div>
          </div>

          {/* Media Info */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoMusicalNoteOutline className="section-icon" /> Media Info</h3>
              <button
                className="regenerate-btn"
                onClick={handleRefreshMediaInfo}
                disabled={refreshingMediaInfo}
              >
                {refreshingMediaInfo ? <><div className="mini-spinner"></div> Refreshing</> : <><IoRefreshOutline /> Refresh</>}
              </button>
            </div>
            <div className="detail-item">
              <span className="detail-label">Definition:</span>
              <span className="detail-value">{contentDetails.definition.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Caption:</span>
              <span className="detail-value">{contentDetails.caption === 'true' ? 'Available' : 'None'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">License:</span>
              <span className="detail-value">{contentDetails.licensedContent ? 'Licensed' : 'Standard'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Content Rating:</span>
              <span className="detail-value">
                {contentDetails.contentRating?.ytRating || 'Standard'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Music Copyright:</span>
              <span className="detail-value">
                {contentDetails.licensedContent ? (
                  <span className="copyright-warning">Yes - May have copyright claims</span>
                ) : (
                  <span className="copyright-safe">No copyright detected</span>
                )}
              </span>
            </div>
          </div>

          {/* Title Box */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoDocumentTextOutline className="section-icon" /> Video Title</h3>
              <button
                className="copy-btn"
                onClick={() => handleCopy(snippet.title, 'titleSection')}
              >
                {copiedSection === 'titleSection' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
              </button>
            </div>
            <div className="title-display">
              {snippet.title}
            </div>
          </div>

          {/* Hashtags Box */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoPricetagsOutline className="section-icon" /> Hashtags</h3>
              <button
                className="copy-btn"
                onClick={() => {
                  const hashtags = snippet.tags && snippet.tags.length > 0 
                    ? snippet.tags.map(tag => `#${tag.replace(/\s+/g, '')}`).join(' ') 
                    : 'No hashtags';
                  handleCopy(hashtags, 'hashtagsSection');
                }}
              >
                {copiedSection === 'hashtagsSection' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
              </button>
            </div>
            <div className="hashtags-display">
              {snippet.tags && snippet.tags.length > 0 ? (
                snippet.tags.map((tag, index) => (
                  <span key={index} className="hashtag">
                    #{tag.replace(/\s+/g, '')}
                  </span>
                ))
              ) : (
                <span className="no-tags">No hashtags available</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoDocumentTextOutline className="section-icon" /> Description</h3>
              <button
                className="copy-btn"
                onClick={() => handleCopy(snippet.description || 'No description available', 'description')}
              >
                {copiedSection === 'description' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
              </button>
            </div>
            <div className="description-box">
              {snippet.description || 'No description available'}
            </div>
          </div>

          {/* Tags */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoPricetagsOutline className="section-icon" /> Tags</h3>
              <button
                className="copy-btn"
                onClick={() => handleCopy(
                  snippet.tags && snippet.tags.length > 0 ? snippet.tags.join(', ') : 'No tags',
                  'tags'
                )}
              >
                {copiedSection === 'tags' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
              </button>
            </div>
            <div className="tags-container">
              {snippet.tags && snippet.tags.length > 0 ? (
                snippet.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="no-tags">No tags</span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="detail-card-full">
            <div className="detail-header">
              <h3><IoImageOutline className="section-icon" /> Thumbnails</h3>
              <button
                className="download-btn"
                onClick={() => handleDownloadThumbnail(
                  snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || '',
                  snippet.title
                )}
              >
                <IoDownloadOutline /> Download
              </button>
            </div>
            <div className="thumbnail-display">
              {(snippet.thumbnails.maxres || snippet.thumbnails.high || snippet.thumbnails.medium) && (
                <img 
                  src={snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url} 
                  alt="Thumbnail" 
                  className="main-thumbnail"
                />
              )}
            </div>
          </div>

          {/* AI SEO Suggestions */}
          <div className="seo-suggestions-section">
            <div className="seo-header">
              <h2 className="seo-title">AI SEO Suggestions by Google Gemini</h2>
              <p className="seo-subtitle">Boost your video ranking and go viral with AI-powered optimization</p>
            </div>

            {loadingSEO ? (
              <div className="loading-seo">
                <div className="spinner"></div>
                <p>Deep analysis in progress... Generating SEO-friendly, viral-optimized content...</p>
                <p className="loading-subtext">This may take up to 60 seconds for best quality results</p>
              </div>
            ) : seoSuggestions ? (
              <div className="seo-content">
                {/* SEO Score */}
                <div className="seo-score-card">
                  <div className="score-circle">
                    <span className="score-number">{seoSuggestions.seoScore}</span>
                    <span className="score-label">/100</span>
                  </div>
                  <p className="score-text">Current SEO Score</p>
                </div>

                {/* Optimized Title */}
                <div className="detail-card-full">
                  <div className="detail-header">
                    <h3><IoDocumentTextOutline className="section-icon" /> Optimized Title</h3>
                    <div className="button-group">
                      <button
                        className="regenerate-btn"
                        onClick={() => handleRegenerate('title')}
                        disabled={regeneratingSection === 'title'}
                      >
                        {regeneratingSection === 'title' ? <><div className="mini-spinner"></div> Regenerating</> : <><IoRefreshOutline /> Regenerate</>}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(seoSuggestions.optimizedTitle, 'aiTitle')}
                      >
                        {copiedSection === 'aiTitle' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className="title-display seo-suggestion">
                    {seoSuggestions.optimizedTitle}
                  </div>
                </div>

                {/* SEO Description */}
                <div className="detail-card-full">
                  <div className="detail-header">
                    <h3><IoDocumentTextOutline className="section-icon" /> SEO Description</h3>
                    <div className="button-group">
                      <button
                        className="regenerate-btn"
                        onClick={() => handleRegenerate('description')}
                        disabled={regeneratingSection === 'description'}
                      >
                        {regeneratingSection === 'description' ? <><div className="mini-spinner"></div> Regenerating</> : <><IoRefreshOutline /> Regenerate</>}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(seoSuggestions.seoDescription, 'aiDesc')}
                      >
                        {copiedSection === 'aiDesc' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className="description-box seo-suggestion">
                    {seoSuggestions.seoDescription}
                  </div>
                </div>

                {/* Best Tags */}
                <div className="detail-card-full">
                  <div className="detail-header">
                    <h3><IoPricetagsOutline className="section-icon" /> Best Tags</h3>
                    <div className="button-group">
                      <button
                        className="regenerate-btn"
                        onClick={() => handleRegenerate('tags')}
                        disabled={regeneratingSection === 'tags'}
                      >
                        {regeneratingSection === 'tags' ? <><div className="mini-spinner"></div> Regenerating</> : <><IoRefreshOutline /> Regenerate</>}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(seoSuggestions.bestTags?.join(', ') || '', 'aiTags')}
                      >
                        {copiedSection === 'aiTags' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className="tags-container">
                    {seoSuggestions.bestTags?.map((tag, index) => (
                      <span key={index} className="tag ai-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Trending Hashtags */}
                <div className="detail-card-full">
                  <div className="detail-header">
                    <h3><IoPricetagsOutline className="section-icon" /> Trending Hashtags</h3>
                    <div className="button-group">
                      <button
                        className="regenerate-btn"
                        onClick={() => handleRegenerate('hashtags')}
                        disabled={regeneratingSection === 'hashtags'}
                      >
                        {regeneratingSection === 'hashtags' ? <><div className="mini-spinner"></div> Regenerating</> : <><IoRefreshOutline /> Regenerate</>}
                      </button>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(seoSuggestions.trendingHashtags?.join(' ') || '', 'aiHashtags')}
                      >
                        {copiedSection === 'aiHashtags' ? <><IoCheckmarkOutline /> Copied</> : <><IoCopyOutline /> Copy</>}
                      </button>
                    </div>
                  </div>
                  <div className="hashtags-display">
                    {seoSuggestions.trendingHashtags?.map((hashtag, index) => (
                      <span key={index} className="hashtag ai-hashtag">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Improvement Tips */}
                <div className="detail-card-full tips-card">
                  <div className="detail-header">
                    <h3><IoStatsChartOutline className="section-icon" /> Improvement Tips</h3>
                  </div>
                  <div className="tips-list">
                    {seoSuggestions.improvementTips?.map((tip, index) => (
                      <div key={index} className="tip-item">
                        <span className="tip-number">{index + 1}</span>
                        <span className="tip-text">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <div className="search-results">
        <h2 className="search-results-title">Search Results</h2>
        <div className="results-grid">
          {searchResults.map((result) => (
            <div
              key={result.id.videoId}
              className="result-card"
              onClick={() => handleSelectVideo(result.id.videoId)}
            >
              <img
                src={result.snippet.thumbnails.medium.url}
                alt={result.snippet.title}
                className="result-thumbnail"
              />
              <div className="result-info">
                <h3 className="result-title">{result.snippet.title}</h3>
                <p className="result-channel">{result.snippet.channelTitle}</p>
                <p className="result-date">
                  {new Date(result.snippet.publishedAt).toLocaleDateString('en-US')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {/* Background Effects */}
      <div className="glow-effect glow-top"></div>
      <div className="glow-effect glow-bottom"></div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="badge"><IoFlashOutline className="inline-icon" /> YouTube Analysis Tool</div>
          <h1 className="title">YouTube SEO Tools</h1>
          <p className="subtitle">Video Analysis & SEO Information</p>
          <p className="description">
            Get complete information and statistics for any YouTube video
          </p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <div className="search-type-selector">
            <button
              className={`type-btn ${searchType === 'url' ? 'active' : ''}`}
              onClick={() => setSearchType('url')}
            >
              <IoLinkOutline className="inline-icon" /> By Link
            </button>
            <button
              className={`type-btn ${searchType === 'title' ? 'active' : ''}`}
              onClick={() => setSearchType('title')}
            >
              <IoSearchOutline className="inline-icon" /> By Title
            </button>
          </div>

          <div className="input-wrapper">
            <input
              type="text"
              className="input-field"
              placeholder={
                searchType === 'url'
                  ? 'Enter YouTube link or video ID...'
                  : 'Enter video title...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <><IoSearchOutline className="inline-icon" /> Analyze</>
              )}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Results */}
        {renderSearchResults()}
        {renderVideoDetails()}

        {/* Footer */}
        <footer className="footer">
          <p className="copyright">
            Copyright © 2025 YouTube SEO Tools. All rights reserved.
          </p>
          <p className="credit">
            Made by <span className="author">Saikat Bangladesh</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
