# Deployment Guide

## Option 1: Railway (Recommended for Full-Stack Apps)

### Why Railway?
- Automatic CI/CD from GitHub
- Handles both frontend and backend in one platform
- Built-in database options
- Zero-config deployments
- Cost-effective for small-medium projects

### Setup Steps:

1. **Create Railway Account**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   railway login
   ```

2. **Project Setup**
   ```bash
   # In your project root
   railway init
   railway link [your-project-id]
   ```

3. **Environment Variables**
   Set in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=5001` (backend)
   - Database connection strings (if using Railway DB)

4. **Deploy Configuration**
   - Frontend: Deployed as static site from `dist/` folder
   - Backend: Runs on Railway with auto-scaling
   - Custom domains supported

5. **Database Migration**
   ```bash
   # If moving from JSON file to PostgreSQL
   railway add postgresql
   # Update backend/server.js to use DATABASE_URL
   ```

### Deployment Process:
1. Push to `main` branch
2. Railway automatically builds and deploys
3. Health checks via `/api/health` endpoint
4. Automatic rollback on failure

## Option 2: Render (Alternative)

### Setup Steps:
1. Connect GitHub repository
2. Create Web Service for backend:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
3. Create Static Site for frontend:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## Option 3: Jenkins Pipeline

### Prerequisites:
- Jenkins server with Node.js plugin
- GitHub webhook configured
- Deployment target servers

### Setup Steps:

1. **Install Jenkins Plugins:**
   - NodeJS Plugin
   - GitHub Integration Plugin
   - Pipeline Plugin
   - Docker Pipeline (optional)

2. **Configure Jenkins:**
   ```bash
   # Add Node.js installation in Global Tool Configuration
   # Configure GitHub credentials
   # Set up webhook: http://your-jenkins-url/github-webhook/
   ```

3. **Pipeline Configuration:**
   - Create new Pipeline job
   - Point to repository with Jenkinsfile
   - Configure branch sources (main branch)

4. **Environment Setup:**
   ```bash
   # In Jenkins global properties, add:
   NODE_VERSION=20
   BACKEND_PORT=5001
   FRONTEND_PORT=3000
   ```

5. **Deployment Targets:**
   Update Jenkinsfile deploy stage with your specific commands:
   ```bash
   # Example for Docker deployment:
   docker build -t chore-pet-backend ./backend
   docker build -t chore-pet-frontend .
   docker push your-registry/chore-pet-backend
   docker push your-registry/chore-pet-frontend
   ```

### Jenkins Pipeline Flow:
1. **Checkout**: Pull latest code
2. **Install**: Install dependencies for both frontend and backend
3. **Lint**: Run linting on both projects
4. **Test**: Run tests (when available)
5. **Build**: Build frontend, validate backend
6. **Deploy**: Deploy to staging, then production after approval

## Recommended Environment Variables:

### Backend (.env):
```
NODE_ENV=production
PORT=5001
DATABASE_URL=your-database-url
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend:
```
VITE_API_URL=https://your-backend-domain.com/api
```

## Database Considerations:

### Current Setup:
- Using JSON file database (`backend/data/db.json`)
- Good for development, not production

### Production Recommendations:
1. **PostgreSQL** (Railway/Render provide managed instances)
2. **MongoDB Atlas** (if preferring NoSQL)
3. **SQLite** (for simple deployments)

### Migration Steps:
1. Update `backend/server.js` to use environment-based database
2. Create database schema/migrations
3. Export existing JSON data
4. Import into production database

## Monitoring and Maintenance:

1. **Health Checks**: Already implemented at `/api/health`
2. **Logging**: Consider adding structured logging (e.g., Winston)
3. **Error Tracking**: Integrate Sentry or similar
4. **Performance**: Add performance monitoring

## Cost Comparison:

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| Railway | $5/month after free hours | $20+/month | Full-stack apps |
| Render | Static sites free, $7/month services | $25+/month | Web services |
| Jenkins | Self-hosted costs | Infrastructure costs | Enterprise |

## Next Steps:

1. Choose deployment platform
2. Set up environment variables
3. Configure database (if upgrading from JSON)
4. Test deployment pipeline
5. Set up domain and SSL
6. Configure monitoring

For immediate deployment, I recommend starting with Railway due to its simplicity and full-stack support.