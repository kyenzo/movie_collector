import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Movie } from '../types/movie';
import { movieAPI, getImageUrl } from '../services/api';
import './MovieList.css';

const MovieList: React.FC = () => {
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'upcoming'>('current');
  const [watchlistMovies, setWatchlistMovies] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [nowPlayingResponse, upcomingResponse] = await Promise.all([
          movieAPI.getNowPlayingMovies(),
          movieAPI.getUpcomingMovies()
        ]);

        setCurrentMovies(nowPlayingResponse.results);
        setUpcomingMovies(upcomingResponse.results);
        
        // Fetch watchlist status for all movies
        const allMovies = [...nowPlayingResponse.results, ...upcomingResponse.results];
        await fetchWatchlistStatus(allMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const fetchWatchlistStatus = async (movies: Movie[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const watchlistSet = new Set<number>();
      
      // Check each movie's watchlist status
      await Promise.all(
        movies.map(async (movie) => {
          try {
            const response = await fetch(`http://localhost:5000/api/watchlist/check/${movie.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.inWatchlist) {
                watchlistSet.add(movie.id);
              }
            }
          } catch (error) {
            console.error('Error checking watchlist status:', error);
          }
        })
      );
      
      setWatchlistMovies(watchlistSet);
    } catch (error) {
      console.error('Error fetching watchlist status:', error);
    }
  };

  const addToWatchlist = async (movie: Movie, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to movie details
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster_path: movie.poster_path,
          movie_release_date: movie.release_date,
          movie_vote_average: movie.vote_average
        })
      });

      if (response.ok) {
        setWatchlistMovies(prev => {
          const newSet = new Set(prev);
          newSet.add(movie.id);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (movieId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/watchlist/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWatchlistMovies(prev => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  const displayMovies = activeTab === 'current' ? currentMovies : upcomingMovies;

  return (
    <div className="movie-list">
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'current' ? 'active' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            Now Playing
          </button>
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
        </div>

        <div className="movies-grid">
          {displayMovies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="movie-card"
            >
              <div className="movie-poster">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  loading="lazy"
                />
                <div className="watchlist-overlay">
                  {watchlistMovies.has(movie.id) ? (
                    <button
                      className="watchlist-button added"
                      onClick={(e) => removeFromWatchlist(movie.id, e)}
                      title="Remove from watchlist"
                    >
                      ✓
                    </button>
                  ) : (
                    <button
                      className="watchlist-button"
                      onClick={(e) => addToWatchlist(movie, e)}
                      title="Add to watchlist"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-meta">
                  <span className="release-date">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="rating">
                    ⭐ {movie.vote_average.toFixed(1)}
                  </span>
                </div>
                <p className="movie-overview">{movie.overview}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieList;