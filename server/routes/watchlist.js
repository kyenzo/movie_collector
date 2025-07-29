const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  reorderWatchlist,
  checkInWatchlist
} = require('../controllers/watchlistController');

// All watchlist routes require authentication
router.use(authenticateToken);

// GET /api/watchlist - Get user's watchlist
router.get('/', getWatchlist);

// POST /api/watchlist - Add movie to watchlist
router.post('/', addToWatchlist);

// DELETE /api/watchlist/:movieId - Remove movie from watchlist
router.delete('/:movieId', removeFromWatchlist);

// PUT /api/watchlist/reorder - Reorder watchlist
router.put('/reorder', reorderWatchlist);

// GET /api/watchlist/check/:movieId - Check if movie is in watchlist
router.get('/check/:movieId', checkInWatchlist);

module.exports = router;