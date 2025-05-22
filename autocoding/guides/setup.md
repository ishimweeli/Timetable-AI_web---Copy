
# Development Environment Setup

## System Requirements

### Minimum Requirements
- **Node.js**: v16.x or higher
- **NPM**: v8.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis**: v6.x or higher
- **Git**: v2.30.0 or higher
- **Operating System**: macOS, Windows 10/11, or Linux (Ubuntu 20.04+ recommended)

### Recommended Specifications
- 8GB RAM (16GB preferred for development)
- 4-core CPU
- 20GB available disk space
- High-speed internet connection

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/your-organization/ai-timetable.git

# Navigate to the project directory
cd ai-timetable

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root directory:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file with your local settings
nano .env
```

Update the following variables in your `.env` file:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_timetable
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=3600

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

# API Configuration
API_PORT=3000
API_BASE_URL=http://localhost:3000/v1
FRONTEND_URL=http://localhost:3001
```

### 3. Database Setup

Create and set up the PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE ai_timetable;

# Connect to the database
\c ai_timetable

# Exit PostgreSQL
\q
```

Run migrations and seed data:

```bash
# Run database migrations
npm run migrate

# Seed database with initial data
npm run seed
```

### 4. Redis Setup

Ensure Redis is running:

```bash
# Check Redis status
redis-cli ping
```

You should receive a `PONG` response if Redis is running correctly.

## Running the Application

### Development Mode

Start the backend API server:

```bash
# Start the API server in development mode
npm run dev:api
```

Start the frontend development server:

```bash
# Start the frontend in development mode
npm run dev:frontend
```

Access the application:
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### Production Build

Build the application for production:

```bash
# Build the frontend
npm run build:frontend

# Build the backend
npm run build:api
```

Start the production servers:

```bash
# Start the production API server
npm run start:api

# Serve the frontend (if needed separately)
npm run start:frontend
```

## Docker Setup (Alternative)

If you prefer using Docker for development:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Development Tools Setup

### VS Code Extensions

Recommended extensions for development:
- ESLint
- Prettier
- EditorConfig
- REST Client
- PostgreSQL
- Docker
- React Developer Tools
- TypeScript Hero

Install them with:

```bash
# Install recommended VS Code extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension editorconfig.editorconfig
code --install-extension humao.rest-client
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-ossdata.vscode-postgresql
code --install-extension burkeholland.simple-react-snippets
code --install-extension rbbit.typescript-hero
```

### Linting and Formatting

Setup linting and formatting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Troubleshooting

### Common Issues

1. **Database Connection Failure**
    - Ensure PostgreSQL service is running
    - Verify database credentials in `.env` file
    - Check network access to the database

2. **Node Module Issues**
    - Try removing `node_modules` and reinstalling:
      ```bash
      rm -rf node_modules
      npm install
      ```

3. **Port Conflicts**
    - Check if ports 3000 and 3001 are already in use
    - Update port numbers in `.env` if needed

4. **Redis Connection Issues**
    - Ensure Redis server is running
    - Verify Redis connection details in `.env`

### Getting Help

If you encounter issues not covered here:

1. Check the project wiki for more detailed documentation
2. Search existing GitHub issues
3. Contact the development team on Slack
4. Create a new GitHub issue with:
    - Detailed description of the problem
    - Environment details (OS, Node version, etc.)
    - Steps to reproduce
    - Error messages and logs

## Next Steps

After setting up your development environment, proceed to:
- [Project Architecture](../architecture.md) for an overview of the system
- [API Documentation](../api/overview.md) for backend API details
- [Frontend Documentation](../frontend/components.md) for UI component details
- [Testing Guide](./testing.md) for information on running and writing tests
- [Contribution Guidelines](./contribution.md) for code contribution procedures
```
