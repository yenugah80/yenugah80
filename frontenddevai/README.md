# FrontendDevAI

> Automated Frontend Component Discovery & Trend Tracking System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%3E%3D4.4-green)](https://www.mongodb.com/)

## 🎯 Overview

FrontendDevAI is an intelligent system that automatically discovers, collects, and curates the latest trends in frontend development. It continuously monitors trusted sources for new components, patterns, libraries, and best practices, providing developers with a centralized, up-to-date resource for frontend development.

## ✨ Key Features

- 🤖 **Automated Data Collection**: Scrapes multiple trusted sources on a scheduled basis
- 🔍 **Smart Deduplication**: Uses similarity algorithms to prevent duplicate entries
- ✅ **Quality Validation**: Ensures all components meet quality standards
- 👥 **Admin Review Workflow**: Human oversight for component approval
- 🏷️ **Trusted Source Filtering**: Users can filter by verified/trusted sources
- 📊 **RESTful API**: Complete API for accessing and managing components
- ⏰ **Configurable Scheduling**: Customizable update frequencies per source
- 📈 **Statistics & Analytics**: Track trends and popular components

## 🌐 Data Sources

- **GitHub Trending** - Popular JavaScript/TypeScript repositories
- **Dev.to** - Frontend development articles and tutorials
- **CSS-Tricks** - CSS patterns and UI techniques
- **Smashing Magazine** - Web development best practices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB (v4.4+)
- npm or yarn

### Installation

```bash
# Navigate to backend directory
cd frontenddevai/backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings
nano .env

# Start MongoDB (if not already running)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start the server
npm start
```

The server will start on `http://localhost:3000`

## 📚 Documentation

Comprehensive documentation is available in the [docs/README.md](./docs/README.md) file, including:

- Detailed architecture overview
- Complete API documentation
- Configuration guide
- Data source details
- Troubleshooting guide
- Development guidelines

## 🔧 Configuration

### Update Schedule

Configure update frequency in `.env`:

```env
# Cron format: minute hour day month day-of-week
SCRAPER_CRON_SCHEDULE=0 */6 * * *  # Every 6 hours
```

### Enable/Disable Sources

```env
ENABLE_GITHUB_TRENDING=true
ENABLE_DEV_TO=true
ENABLE_CSS_TRICKS=true
ENABLE_SMASHING_MAGAZINE=true
```

### Approval Settings

```env
REQUIRE_ADMIN_APPROVAL=true
AUTO_APPROVE_FROM_TRUSTED_SOURCES=false
```

## 🔌 API Endpoints

### Components
- `GET /api/components` - Get all components (with filters)
- `GET /api/components/pending` - Get pending components
- `POST /api/components/:id/approve` - Approve a component
- `POST /api/components/:id/reject` - Reject a component

### Scraper Management
- `POST /api/scraper/run` - Trigger manual scraper run
- `GET /api/scraper/status` - Get scraper status
- `GET /api/scheduler/status` - Get scheduler status

### Statistics
- `GET /api/stats` - Get component statistics
- `GET /health` - Health check endpoint

## 📊 Component Categories

Components are automatically categorized into:

- **ui-component** - Reusable UI components
- **pattern** - Design and coding patterns
- **library** - JavaScript libraries
- **framework** - Frontend frameworks
- **tool** - Development tools
- **best-practice** - Best practices and techniques

## 🧪 Testing

```bash
npm test
```

## 🛠️ Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run linter
npm run lint
```

## 📝 Update Process

1. **Automated Scraping**: Scrapers run on configured schedule
2. **Data Parsing**: Raw data is normalized to standard format
3. **Validation**: Components validated against quality rules
4. **Deduplication**: Similarity checking prevents duplicates
5. **Review Queue**: Components added to admin review queue
6. **Approval**: Admins approve/reject components
7. **Publication**: Approved components available via API

## 🔐 Security

- API authentication (recommended for production)
- Rate limiting (configurable)
- Input validation on all endpoints
- CORS configuration
- Environment variable protection

## 🤝 Contributing

Contributions are welcome! To add a new data source:

1. Create a scraper class extending `BaseScraper`
2. Add configuration in `config/sources.js`
3. Update environment variables
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Data sourced from GitHub, Dev.to, CSS-Tricks, and Smashing Magazine
- Built with Node.js, Express, and MongoDB
- Uses cheerio for HTML parsing and axios for HTTP requests

## 📞 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with ❤️ for the frontend development community**
