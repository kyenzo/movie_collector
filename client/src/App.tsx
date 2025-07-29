import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Landing from './components/Landing';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import Watchlist from './components/Watchlist';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/movies" 
              element={
                <ProtectedRoute>
                  <MovieList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/movie/:id" 
              element={
                <ProtectedRoute>
                  <MovieDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/watchlist" 
              element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
