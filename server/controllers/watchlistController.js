const pool = require('../config/database');

const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT movie_id, movie_title, movie_poster_path, movie_release_date, 
             movie_vote_average, added_at, sort_order
      FROM watchlist 
      WHERE user_id = $1 
      ORDER BY sort_order ASC, added_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Transform to match Movie interface
    const watchlist = result.rows.map(row => ({
      id: row.movie_id,
      title: row.movie_title,
      poster_path: row.movie_poster_path,
      release_date: row.movie_release_date,
      vote_average: parseFloat(row.movie_vote_average) || 0,
      added_at: row.added_at,
      sort_order: row.sort_order
    }));
    
    res.json(watchlist);
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movie_id, movie_title, movie_poster_path, movie_release_date, movie_vote_average } = req.body;
    
    if (!movie_id || !movie_title) {
      return res.status(400).json({ error: 'Movie ID and title are required' });
    }
    
    // Get the highest sort order for this user and increment by 1
    const maxOrderQuery = 'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM watchlist WHERE user_id = $1';
    const maxOrderResult = await pool.query(maxOrderQuery, [userId]);
    const nextOrder = maxOrderResult.rows[0].max_order + 1;
    
    const insertQuery = `
      INSERT INTO watchlist (user_id, movie_id, movie_title, movie_poster_path, movie_release_date, movie_vote_average, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, movie_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      userId, movie_id, movie_title, movie_poster_path, movie_release_date, movie_vote_average, nextOrder
    ]);
    
    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'Movie already in watchlist' });
    }
    
    res.status(201).json({ message: 'Movie added to watchlist successfully' });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    const deleteQuery = 'DELETE FROM watchlist WHERE user_id = $1 AND movie_id = $2';
    const result = await pool.query(deleteQuery, [userId, parseInt(movieId)]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Movie not found in watchlist' });
    }
    
    res.json({ message: 'Movie removed from watchlist successfully' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const reorderWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieIds } = req.body;
    
    if (!Array.isArray(movieIds)) {
      return res.status(400).json({ error: 'movieIds must be an array' });
    }
    
    // Update sort order for each movie
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < movieIds.length; i++) {
        await client.query(
          'UPDATE watchlist SET sort_order = $1 WHERE user_id = $2 AND movie_id = $3',
          [i + 1, userId, movieIds[i]]
        );
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Watchlist reordered successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reorder watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkInWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;
    
    const query = 'SELECT id FROM watchlist WHERE user_id = $1 AND movie_id = $2';
    const result = await pool.query(query, [userId, parseInt(movieId)]);
    
    res.json({ inWatchlist: result.rows.length > 0 });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  reorderWatchlist,
  checkInWatchlist
};