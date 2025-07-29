import React, { useState, useEffect } from 'react';
import { Movie } from '../types/movie';
import { getImageUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Watchlist.css';

const Watchlist: React.FC = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/watchlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newWatchlist = [...watchlist];
    const draggedItem = newWatchlist[draggedIndex];
    
    // Remove the dragged item
    newWatchlist.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newWatchlist.splice(dropIndex, 0, draggedItem);
    
    setWatchlist(newWatchlist);
    setDraggedIndex(null);

    // Update order in backend
    updateWatchlistOrder(newWatchlist);
  };

  const updateWatchlistOrder = async (newOrder: Movie[]) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/watchlist/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movieIds: newOrder.map(movie => movie.id)
        })
      });
    } catch (error) {
      console.error('Error updating watchlist order:', error);
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="watchlist-container">
        <div className="loading">Loading your watchlist...</div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>My Watchlist</h1>
        <p className="watchlist-subtitle">
          {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-watchlist">
          <h2>Your watchlist is empty</h2>
          <p>Add movies to your watchlist from the Movies page to see them here.</p>
        </div>
      ) : (
        <div className="watchlist-movies">
          {watchlist.map((movie, index) => (
            <div
              key={movie.id}
              className={`watchlist-movie ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="movie-poster-small">
                <img
                  src={getImageUrl(movie.poster_path, 'w200')}
                  alt={movie.title}
                  loading="lazy"
                />
                <button 
                  className="remove-button"
                  onClick={() => removeFromWatchlist(movie.id)}
                  title="Remove from watchlist"
                >
                  ×
                </button>
              </div>
              <div className="movie-info-small">
                <h3 className="movie-title-small">{movie.title}</h3>
                <div className="movie-rating-small">
                  ⭐ {movie.vote_average.toFixed(1)}
                </div>
                <div className="movie-year">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;