-- Database initialization script for Movie Collector
-- This script runs when the PostgreSQL container starts for the first time

-- Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create movie_lists table for user's personal movie collections
CREATE TABLE movie_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL, -- TMDB movie ID
    movie_title VARCHAR(255) NOT NULL,
    movie_poster_path VARCHAR(255),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    watched BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, movie_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_movie_lists_user_id ON movie_lists(user_id);
CREATE INDEX idx_movie_lists_movie_id ON movie_lists(movie_id);
CREATE INDEX idx_movie_lists_watched ON movie_lists(watched);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- Uncomment the lines below if you want sample data
/*
INSERT INTO users (username, email, password_hash) VALUES
('testuser', 'test@example.com', '$2b$10$example.hash.here'),
('moviefan', 'fan@movies.com', '$2b$10$another.example.hash');
*/