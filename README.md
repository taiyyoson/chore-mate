# ChorePet 🐾

A gamified chore management app for roommates that motivates task completion through virtual pet care.

## Overview

ChorePet transforms household chores into an engaging experience where completing tasks keeps a shared virtual pet healthy and happy. 

## Features

### Pet Health System
- Pet health ranges from 0-100%
- Completing chores increases pet health (+10 per completed chore)
- Different pet animations based on health levels:
  - 90-100%: Happy animations
  - 80-89%: Normal state
  - 60-79%: Slightly concerned
  - 40-59%: Sad expressions
  - 20-39%: Very sad
  - 0-19%: Critical/dying state

## Tech Stack

### Frontend
- **React 19** with hooks (useState, useEffect)
- **Framer Motion** for smooth animations
- **Vite** for fast development and building
- **CSS3** for styling and responsive design

### Backend
- **Node.js** with Express.js
- **File-based JSON database** (development, migrating to mySQL)
- **CORS** enabled for frontend communication
- **RESTful API** architecture

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:username` - Update user
- `PATCH /api/users/:username/health` - Update pet health
- `DELETE /api/users/:username` - Delete user

### Chores
- `GET /api/chores` - Get all chores
- `GET /api/chores/:id` - Get specific chore
- `POST /api/chores` - Create new chore
- `PUT /api/chores/:id` - Update chore
- `PATCH /api/chores/:id/complete` - Mark chore progress
- `PATCH /api/chores/:id/reset` - Reset chore progress
- `DELETE /api/chores/:id` - Delete chore

### Health Check
- `GET /api/health` - Server status check

## Installation

### Prerequisites
- Node.js 20.19+ or 22.12+ (recommended)
- npm 10+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chore-pet
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment setup**
   ```bash
   # Backend environment is pre-configured in backend/.env
   # Default settings:
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/chorepet
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: http://localhost:5001

2. **Start the frontend development server**
   ```bash
   # In the root directory
   npm run dev
   ```
   Frontend runs on: http://localhost:5173 or 5174

### Production Build

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
chore-pet/
├── backend/                 # Backend API server
│   ├── data/               # JSON database files
│   │   └── db.json        # User and chore data
│   ├── models/            # Data models (Mongoose schemas)
│   ├── routes/            # API route handlers
│   │   ├── users-simple.js    # User CRUD operations
│   │   └── chores-simple.js   # Chore CRUD operations
│   ├── server.js          # Express server setup
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment configuration
├── src/                   # Frontend React application
│   ├── assets/           # Pet animation images
│   ├── services/         # API service functions
│   │   └── api.js        # Frontend-backend communication
│   ├── App.jsx           # Main application component
│   ├── Pet.jsx           # Pet animation component
│   └── main.jsx          # React app entry point
├── public/               # Static assets
├── package.json          # Frontend dependencies
└── vite.config.js        # Vite configuration
```

## Usage

1. **Create User Account**: Sign up with a username to get started
2. **Login**: Use existing username to access your account
3. **Add Chores**: Create chores with frequency requirements (how many times to complete)
4. **Assign Chores**: Assign chores to specific roommates
5. **Complete Tasks**: Click on assigned chores to increment progress
6. **Monitor Pet Health**: Watch your pet's health improve as chores are completed

## Data Persistence

- All data is stored in `backend/data/db.json`
- User accounts, pet health, and chore progress persist between sessions
- Real-time updates when multiple users interact with the system

## Future Enhancements

### Planned Features
- **Real-time Synchronization**: WebSocket integration for live updates
- **Authentication**: JWT-based secure authentication
- **Database Migration**: PostgreSQL or MongoDB integration  
- **Email Notifications**: Automated reminders for overdue chores
- **Mobile Responsiveness**: Enhanced mobile experience
- **Pet Customization**: Multiple pet types and customization options
- **Analytics Dashboard**: Chore completion statistics and trends
- **Reward System**: Achievement badges and milestone rewards

### Technical Improvements
- **Error Handling**: Enhanced error boundaries and user feedback
- **Testing**: Unit and integration test coverage
- **Performance**: Optimization for larger datasets
- **Security**: Input validation and rate limiting
- **Deployment**: Production hosting configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Pet sprites and animations designed for pixel-perfect charm
- Built with modern React patterns and best practices
- Inspired by gamification principles in productivity apps