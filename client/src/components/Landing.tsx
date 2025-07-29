import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types/movie';
import { movieAPI, getImageUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, checkUsernameAvailability, isAuthenticated } = useAuth();
  
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllMovies, setShowAllMovies] = useState(false);
  const [loadingAllMovies, setLoadingAllMovies] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [registerAttempted, setRegisterAttempted] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/movies');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      try {
        const response = await movieAPI.getNowPlayingMovies();
        setFeaturedMovies(response.results.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }

    // Check username availability in real-time
    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailabilityHandler(value);
    } else if (name === 'username') {
      setUsernameAvailable(null);
    }
  };

  const checkUsernameAvailabilityHandler = async (username: string) => {
    setCheckingUsername(true);
    try {
      const available = await checkUsernameAvailability(username);
      setUsernameAvailable(available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleBrowseAllMovies = async () => {
    if (showAllMovies) {
      // If already showing all movies, hide them
      setShowAllMovies(false);
      return;
    }

    setLoadingAllMovies(true);
    try {
      // Fetch multiple pages to get up to 30 movies
      const [page1Response, page2Response] = await Promise.all([
        fetch('http://localhost:5000/api/movies/now-playing?page=1').then(res => res.json()),
        fetch('http://localhost:5000/api/movies/now-playing?page=2').then(res => res.json())
      ]);

      // Combine results and take first 30
      const combinedMovies = [...page1Response.results, ...page2Response.results].slice(0, 30);
      setAllMovies(combinedMovies);
      setShowAllMovies(true);
    } catch (error) {
      console.error('Error fetching all movies:', error);
    } finally {
      setLoadingAllMovies(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setLoginAttempted(true); // Mark form as attempted for styling
    
    try {
      await login(loginForm.email, loginForm.password);
      // Navigation will happen automatically via useEffect
      // Clear form only on successful login
      setLoginForm({ email: '', password: '' });
      setLoginAttempted(false); // Reset attempted state on success
    } catch (error: any) {
      // Keep form data and show specific error message
      const errorMsg = error.message || 'Login failed. Please check your credentials.';
      setErrorMessage(errorMsg);
      // Form data is preserved - don't clear loginForm
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    setRegisterAttempted(true); // Mark form as attempted for styling

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Passwords do not match!');
      setIsSubmitting(false);
      return;
    }

    if (usernameAvailable === false) {
      setErrorMessage('Username is not available. Please choose another one.');
      setIsSubmitting(false);
      return;
    }

    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      // Navigation will happen automatically via useEffect
      setRegisterAttempted(false); // Reset attempted state on success
    } catch (error: any) {
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    // Reset forms and states when switching modes
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
    setErrorMessage('');
    setSuccessMessage('');
    setUsernameAvailable(null);
    setCheckingUsername(false);
    setLoginAttempted(false);
    setRegisterAttempted(false);
  };

  return (
    <div className="landing">
      <div className="landing-container">
        <div className="landing-left">
          <div className="hero-section">
            <p className="hero-subtitle">
              Discover, track, and organize your favorite movies
            </p>
            <p className="hero-description">
              Create your personal movie wishlist, track what you've watched, 
              rate your favorites, and never miss a great film again. 
              Browse current cinema releases and upcoming movies all in one place.
            </p>
          </div>

          <div className="featured-section">
            <h2 className="section-title">Now Playing in Cinemas</h2>
            {loading ? (
              <div className="loading-featured">Loading movies...</div>
            ) : (
              <div className="featured-movies">
                {(showAllMovies ? allMovies : featuredMovies).map((movie) => (
                  <div
                    key={movie.id}
                    className="featured-movie"
                  >
                    <div className="movie-poster-large">
                      <img
                        src={getImageUrl(movie.poster_path, 'w500')}
                        alt={movie.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="movie-info-large">
                      <h3 className="movie-title-large">{movie.title}</h3>
                      <div className="movie-rating-large">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="browse-more">
              <button 
                onClick={handleBrowseAllMovies} 
                className="browse-button"
                disabled={loadingAllMovies}
              >
                {loadingAllMovies 
                  ? 'Loading...' 
                  : showAllMovies 
                    ? 'Show Less' 
                    : 'Browse All Movies'
                }
              </button>
            </div>
          </div>
        </div>

        <div className="landing-right">
          <div className="login-section">
            <h2 className="login-title">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="login-subtitle">
              {isRegister 
                ? 'Join us to create your personal movie collection' 
                : 'Sign in to access your movie collection'
              }
            </p>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="message success-message">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="message error-message">
                {errorMessage}
              </div>
            )}
            
            {!isRegister ? (
              <form 
                onSubmit={handleLoginSubmit} 
                className={`login-form ${loginAttempted ? 'form-attempted' : ''}`}
              >
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginInputChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form 
                onSubmit={handleRegisterSubmit} 
                className={`login-form ${registerAttempted ? 'form-attempted' : ''}`}
              >
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-status">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={registerForm.username}
                      onChange={handleRegisterInputChange}
                      placeholder="Choose a username"
                      required
                      minLength={3}
                    />
                    {registerForm.username.length >= 3 && (
                      <div className="username-status">
                        {checkingUsername ? (
                          <span className="checking">Checking...</span>
                        ) : usernameAvailable === true ? (
                          <span className="available">✓ Available</span>
                        ) : usernameAvailable === false ? (
                          <span className="unavailable">✗ Not available</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-email">Email</label>
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password">Password</label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterInputChange}
                    placeholder="Create a password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterInputChange}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>

                <button 
                  type="submit" 
                  className="login-button"
                  disabled={isSubmitting || usernameAvailable === false}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}

            <div className="login-footer">
              <p>
                {isRegister ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button 
                type="button" 
                onClick={toggleMode} 
                className="register-link"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;