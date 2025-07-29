const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Watchlist routes
app.use('/api/watchlist', watchlistRoutes);

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.get('/api/movies/popular', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

app.get('/api/movies/upcoming', async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

app.get('/api/movies/now-playing', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: page
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch now playing movies' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/credits`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      }),
      axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US' }
      })
    ]);

    const movieData = {
      ...movieResponse.data,
      credits: creditsResponse.data,
      videos: videosResponse.data
    };

    res.json(movieData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});