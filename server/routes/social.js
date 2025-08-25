const express = require('express');
const axios = require('axios');

const router = express.Router();

// @desc    Get Instagram posts
// @route   GET /api/social/instagram
// @access  Public
router.get('/instagram', async (req, res) => {
  try {
    if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Instagram integration not configured'
      });
    }

    const response = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
    );

    const posts = response.data.data.slice(0, 12); // Get latest 12 posts

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    res.status(200).json({
      success: true,
      data: [],
      message: 'Unable to fetch Instagram posts'
    });
  }
});

// @desc    Get YouTube videos
// @route   GET /api/social/youtube
// @access  Public
router.get('/youtube', async (req, res) => {
  try {
    if (!process.env.YOUTUBE_API_KEY || !process.env.YOUTUBE_CHANNEL_ID) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'YouTube integration not configured'
      });
    }

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&channelId=${process.env.YOUTUBE_CHANNEL_ID}&part=snippet,id&order=date&maxResults=12`
    );

    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(200).json({
      success: true,
      data: [],
      message: 'Unable to fetch YouTube videos'
    });
  }
});

module.exports = router;