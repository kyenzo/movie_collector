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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [nowPlayingResponse, upcomingResponse] = await Promise.all([
          movieAPI.getNowPlayingMovies(),
          movieAPI.getUpcomingMovies()
        ]);

        setCurrentMovies(nowPlayingResponse.results);
        setUpcomingMovies(upcomingResponse.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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