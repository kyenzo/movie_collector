# Movie Collector

A responsive movie website built with Node.js, React, and TypeScript that displays current and upcoming movies using The Movie Database (TMDB) API.

## Features

- 🎬 Browse current movies in theaters and upcoming releases
- 🔍 View detailed movie information including cast, synopsis, and ratings
- 🎥 Watch movie trailers integrated with YouTube
- 📱 Fully responsive design for mobile and desktop
- ⚡ Fast and modern user interface with React and TypeScript

## Screenshots

The application features:
- Clean, modern movie list with poster images and ratings
- Detailed movie pages with hero backgrounds and cast information
- Integrated YouTube trailers
- Responsive design that works on all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose
- TMDB API key (free from https://www.themoviedb.org/settings/api)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie_collector
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Set up TMDB API Key**
   
   Get your free API key from [TMDB](https://www.themoviedb.org/settings/api), then choose one of these approaches:
   
   **Option A: Export as Environment Variable (Recommended)**
   ```bash
   export TMDB_API_KEY=your_actual_api_key_here
   ```
   
   **Option B: Use .env File**
   - Copy `.env.example` to `.env`
   - Add your API key to `.env`:
     ```
     TMDB_API_KEY=your_actual_api_key_here
     PORT=5000
     ```

4. **Start the PostgreSQL database**
   ```bash
   docker-compose up -d
   ```
   
   This will:
   - Start PostgreSQL container on port 5432
   - Create the database with initial schema
   - Set up tables for users and movie lists

5. **Install Node.js dependencies**
   ```bash
   npm install
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and React frontend (port 3000).

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432 (movie_collector database)

## API Endpoints

The backend provides the following endpoints:

- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/upcoming` - Get upcoming movies
- `GET /api/movies/now-playing` - Get movies currently in theaters
- `GET /api/movies/:id` - Get detailed movie information including cast and videos

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **CSS3** - Responsive styling with Flexbox and Grid

### External APIs
- **TMDB API** - Movie data, images, and videos
- **YouTube** - Trailer playback

## Project Structure

```
movie_collector/
├── server/
│   └── index.js          # Express server
├── client/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript type definitions
│   │   └── App.tsx       # Main App component
│   └── public/           # Static assets
├── .env.example          # Environment variables template
└── package.json          # Project configuration
```

## Development

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the React frontend
- `npm run build` - Build the React app for production
- `npm start` - Start the production server

### Environment Variables

- `TMDB_API_KEY` - Your TMDB API key (required) - can be set via export or .env file
- `PORT` - Backend server port (default: 5000)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: movie_collector)
- `DB_USER` - Database username (default: postgres)
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT token signing

### Docker Commands

- `docker-compose up -d` - Start PostgreSQL database in background
- `docker-compose down` - Stop and remove containers
- `docker-compose logs postgres` - View database logs
- `docker-compose exec postgres psql -U postgres -d movie_collector` - Connect to database

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie data API
- [React](https://reactjs.org/) for the amazing UI framework
- [YouTube](https://www.youtube.com/) for trailer integration