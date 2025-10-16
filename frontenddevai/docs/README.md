# FrontendDevAI - Automated Component Discovery System

## Overview

FrontendDevAI is an automated system for discovering, collecting, and managing the latest frontend development trends, components, patterns, and best practices from trusted web sources. The system includes automated scraping, deduplication, validation, and an administrative review workflow.

## Features

- **Automated Data Collection**: Periodically scrapes frontend component data from multiple trusted sources
- **Multiple Data Sources**: 
  - GitHub Trending (JavaScript/TypeScript repositories)
  - Dev.to (Frontend development articles)
  - CSS-Tricks (RSS feed)
  - Smashing Magazine (RSS feed)
- **Deduplication**: Intelligent duplicate detection using similarity algorithms
- **Validation**: Ensures data quality with configurable validation rules
- **Administrative Review**: Workflow for approving/rejecting new components
- **Trusted Component Filtering**: Users can filter to view only verified/trusted components
- **RESTful API**: Complete API for accessing and managing components
- **Scheduled Updates**: Configurable cron-based scheduling for automated updates

## Architecture

```
frontenddevai/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── models/          # Database models (Mongoose schemas)
│   │   ├── scrapers/        # Scraper implementations
│   │   ├── services/        # Business logic services
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Main entry point
│   ├── tests/               # Test files
│   ├── package.json         # Dependencies and scripts
│   ├── .env.example         # Environment variables template
│   └── .gitignore           # Git ignore rules
├── docs/                    # Documentation
└── data/                    # Data files
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup

1. **Clone the repository**:
   ```bash
   cd frontenddevai/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/frontenddevai
   SCRAPER_CRON_SCHEDULE=0 */6 * * *
   GITHUB_TOKEN=your_github_token_here
   ENABLE_GITHUB_TRENDING=true
   ENABLE_DEV_TO=true
   ENABLE_CSS_TRICKS=true
   ENABLE_SMASHING_MAGAZINE=true
   REQUIRE_ADMIN_APPROVAL=true
   ```

4. **Start MongoDB**:
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or use your local MongoDB installation
   mongod
   ```

5. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Data Sources

### 1. GitHub Trending
- **URL**: https://github.com/trending/javascript
- **Update Frequency**: Every 6 hours (configurable)
- **Data Type**: Popular repositories, libraries, frameworks
- **Trusted**: Yes

### 2. Dev.to
- **URL**: https://dev.to/api/articles
- **Update Frequency**: Every 12 hours (configurable)
- **Data Type**: Frontend development articles, tutorials, best practices
- **Trusted**: Yes

### 3. CSS-Tricks
- **URL**: https://css-tricks.com/feed/
- **Update Frequency**: Every 2 days (configurable)
- **Data Type**: CSS patterns, UI components, best practices
- **Trusted**: Yes

### 4. Smashing Magazine
- **URL**: https://www.smashingmagazine.com/feed/
- **Update Frequency**: Every 2 days (configurable)
- **Data Type**: Web development patterns, UI/UX best practices
- **Trusted**: Yes

## API Documentation

### Components

#### Get All Components
```http
GET /api/components
```

Query Parameters:
- `status` (optional): Filter by status (pending, approved, rejected)
- `trustedOnly` (optional): Show only trusted components (true/false)
- `category` (optional): Filter by category
- `search` (optional): Search by text
- `limit` (optional): Number of results (default: 50)

Example:
```bash
curl "http://localhost:3000/api/components?status=approved&trustedOnly=true&limit=10"
```

#### Get Pending Components
```http
GET /api/components/pending
```

Returns all components awaiting administrative review.

#### Approve Component
```http
POST /api/components/:componentId/approve
```

Body:
```json
{
  "verifiedBy": "admin-username"
}
```

#### Reject Component
```http
POST /api/components/:componentId/reject
```

Body:
```json
{
  "reason": "Reason for rejection"
}
```

### Scraper Management

#### Trigger Manual Scraper Run
```http
POST /api/scraper/run
```

Body (optional):
```json
{
  "source": "github-trending"
}
```

Runs all scrapers or a specific scraper immediately.

#### Get Scraper Status
```http
GET /api/scraper/status
```

Returns status of all configured scrapers.

#### Get Scheduler Status
```http
GET /api/scheduler/status
```

Returns current scheduler configuration and status.

### Statistics

#### Get Statistics
```http
GET /api/stats
```

Returns statistics about components:
- Total count
- Count by status
- Count by category
- Count by source
- Trusted component count

## Update Process

### Automated Updates

1. **Scheduled Execution**: The scheduler runs according to the configured cron schedule
2. **Data Fetching**: Each enabled scraper fetches data from its source
3. **Parsing**: Raw data is parsed into standardized component format
4. **Validation**: Components are validated against defined rules
5. **Deduplication**: System checks for duplicates using similarity algorithms
6. **Storage**: Valid, non-duplicate components are saved to database
7. **Status**: Components are marked as 'pending' or 'approved' based on configuration

### Manual Triggers

Administrators can manually trigger scraper runs:

```bash
curl -X POST http://localhost:3000/api/scraper/run
```

### Review Workflow

1. **Pending Queue**: New components start in 'pending' status
2. **Admin Review**: Administrators review pending components via API
3. **Approval/Rejection**: Admin approves or rejects each component
4. **User Visibility**: Only approved components are visible to end users (with proper filters)

## Configuration

### Update Frequency

Edit `.env` file to change update frequency:

```env
# Cron format: minute hour day month day-of-week
# Examples:
# Every 6 hours: 0 */6 * * *
# Daily at 2 AM: 0 2 * * *
# Every Monday at 9 AM: 0 9 * * 1
SCRAPER_CRON_SCHEDULE=0 */6 * * *
```

### Enable/Disable Sources

```env
ENABLE_GITHUB_TRENDING=true
ENABLE_DEV_TO=true
ENABLE_CSS_TRICKS=false
ENABLE_SMASHING_MAGAZINE=true
```

### Auto-Approval Settings

```env
# Require admin approval for all components
REQUIRE_ADMIN_APPROVAL=true

# Auto-approve components from trusted sources
AUTO_APPROVE_FROM_TRUSTED_SOURCES=false
```

### Deduplication Threshold

Edit `src/config/sources.js`:

```javascript
deduplication: {
  similarityThreshold: 0.85, // 85% similarity threshold
  checkFields: ['name', 'description', 'repository.url']
}
```

## Deduplication Algorithm

The system uses Levenshtein distance to calculate similarity between components:

1. **Name Similarity**: Compares component names
2. **URL Matching**: Exact match on repository URLs
3. **Description Similarity**: Compares descriptions
4. **Threshold**: Components with >85% similarity are marked as duplicates

## Validation Rules

Components must meet these criteria:

- **Required Fields**: name, description, source
- **Description Length**: 20-500 characters
- **Valid Category**: Must be one of: ui-component, pattern, library, framework, tool, best-practice
- **Valid Source**: Must come from configured sources

## Component Data Model

```javascript
{
  componentId: String,        // Unique identifier
  name: String,               // Component name
  description: String,        // Description
  category: String,           // Category type
  tags: [String],            // Associated tags
  source: {
    name: String,            // Source name
    url: String,             // Source URL
    fetchedAt: Date          // Fetch timestamp
  },
  repository: {
    url: String,             // Repository URL
    stars: Number,           // GitHub stars or likes
    lastUpdated: Date        // Last update date
  },
  status: String,            // pending, approved, rejected, archived
  isTrusted: Boolean,        // From trusted source
  verifiedBy: String,        // Admin who verified
  verifiedAt: Date,          // Verification timestamp
  popularity: {
    score: Number,           // Calculated score
    views: Number            // View count
  },
  isDuplicate: Boolean,      // Duplicate flag
  duplicateOf: ObjectId      // Reference to original
}
```

## Testing

Run tests:

```bash
npm test
```

## Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T22:00:00.000Z",
  "database": "connected"
}
```

### Logs

All scraper runs and operations are logged to console. Consider setting up a logging service for production.

## Troubleshooting

### Database Connection Issues

1. Ensure MongoDB is running: `mongod --version`
2. Check connection string in `.env`
3. Verify network access to MongoDB

### Scraper Failures

1. Check scraper status: `GET /api/scraper/status`
2. Review console logs for error messages
3. Verify internet connectivity
4. Check if source websites are accessible

### No Data Being Collected

1. Verify scrapers are enabled in `.env`
2. Check scheduler is running: `GET /api/scheduler/status`
3. Manually trigger a run: `POST /api/scraper/run`
4. Review validation and deduplication settings

## Development

### Adding a New Data Source

1. Create a new scraper class extending `BaseScraper`
2. Implement the `scrape()` method
3. Add configuration in `src/config/sources.js`
4. Add environment variable in `.env.example`
5. Update documentation

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` for auto-reloading on file changes.

## Security Considerations

- **API Authentication**: Consider adding authentication for admin endpoints
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: All inputs are validated before processing
- **CORS**: Configure CORS properly for production
- **Environment Variables**: Keep sensitive data in `.env` (not committed to git)

## License

MIT

## Support

For issues, questions, or contributions, please refer to the project repository.
