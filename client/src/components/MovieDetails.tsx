import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie, Video } from '../types/movie';
import { movieAPI, getImageUrl } from '../services/api';
import './MovieDetails.css';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<Video | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        const movieData = await movieAPI.getMovieDetails(parseInt(id));
        setMovie(movieData);

        const trailer = movieData.videos?.results.find(
          (video) => video.type === 'Trailer' && video.site === 'YouTube'
        );
        if (trailer) {
          setSelectedTrailer(trailer);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading movie details...</div>;
  }

  if (!movie) {
    return <div className="error">Movie not found</div>;
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="movie-details">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div
        className="movie-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${getImageUrl(movie.backdrop_path, 'original')})`
        }}
      >
        <div className="hero-content">
          <div className="movie-poster-large">
            <img
              src={getImageUrl(movie.poster_path, 'w500')}
              alt={movie.title}
            />
          </div>
          <div className="movie-info-main">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              <span className="release-year">
                {new Date(movie.release_date).getFullYear()}
              </span>
              {movie.runtime && (
                <span className="runtime">{formatRuntime(movie.runtime)}</span>
              )}
              <span className="rating">
                ⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)
              </span>
            </div>
            {movie.genres && (
              <div className="genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
            <p className="movie-overview">{movie.overview}</p>
            {movie.budget && movie.budget > 0 && (
              <div className="budget-revenue">
                <div>
                  <strong>Budget:</strong> {formatCurrency(movie.budget)}
                </div>
                {movie.revenue && movie.revenue > 0 && (
                  <div>
                    <strong>Revenue:</strong> {formatCurrency(movie.revenue)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTrailer && (
        <div className="trailer-section">
          <div className="container">
            <h2>Trailer</h2>
            <div className="trailer-container">
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${selectedTrailer.key}`}
                title={selectedTrailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {movie.credits && movie.credits.cast.length > 0 && (
        <div className="cast-section">
          <div className="container">
            <h2>Cast</h2>
            <div className="cast-grid">
              {movie.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="cast-member">
                  <div className="actor-photo">
                    <img
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, 'w185')
                          : '/placeholder-person.jpg'
                      }
                      alt={actor.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTg1IiBoZWlnaHQ9IjI3OCIgdmlld0JveD0iMCAwIDE4NSAyNzgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODUiIGhlaWdodD0iMjc4IiBmaWxsPSIjRTVFNUU1Ii8+CjxwYXRoIGQ9Ik05Mi41IDEzOUM5Mi41IDEzOSA5Mi41IDEzOSA5Mi41IDEzOUM5Mi41IDEzOSA5Mi41IDEzOSA5Mi41IDEzOUM5Mi41IDEzOSA5Mi41IDEzOSA5Mi41IDEzOUMxMDcuMTg4IDEzOSAxMTkgMTI3LjE4OCAxMTkgMTEyLjVDMTE5IDk3LjgxMjUgMTA3LjE4OCA4NiA5Mi41IDg2Qzc3LjgxMjUgODYgNjYgOTcuODEyNSA2NiAxMTIuNUM2NiAxMjcuMTg4IDc3LjgxMjUgMTM5IDkyLjUgMTM5WiIgZmlsbD0iI0NFQ0VDRSIvPgo8cGF0aCBkPSJNNzUgMTc4SDE0OUMxNTYuNzMgMTc4IDE2MyAxODQuMjcgMTYzIDE5MlYyMDBIMjFWMTkyQzIxIDE4NC4yNyAyNy4yNyAxNzggMzUgMTc4SDc1WiIgZmlsbD0iI0NFQ0VDRSIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="actor-info">
                    <h4 className="actor-name">{actor.name}</h4>
                    <p className="character-name">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;