import axios from 'axios';
import { Movie, MovieResponse } from '../types/movie';

const API_BASE_URL = 'http://localhost:5000/api';

export const movieAPI = {
  getPopularMovies: async (): Promise<MovieResponse> => {
    const response = await axios.get(`${API_BASE_URL}/movies/popular`);
    return response.data;
  },

  getUpcomingMovies: async (): Promise<MovieResponse> => {
    const response = await axios.get(`${API_BASE_URL}/movies/upcoming`);
    return response.data;
  },

  getNowPlayingMovies: async (): Promise<MovieResponse> => {
    const response = await axios.get(`${API_BASE_URL}/movies/now-playing`);
    return response.data;
  },

  getMovieDetails: async (id: number): Promise<Movie> => {
    const response = await axios.get(`${API_BASE_URL}/movies/${id}`);
    return response.data;
  }
};

export const getImageUrl = (path: string, size: string = 'w500'): string => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};