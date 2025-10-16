# API Usage Examples

This document provides practical examples of using the FrontendDevAI API.

## Base URL

```
http://localhost:3000/api
```

## Authentication

> Note: Current version does not require authentication. Add authentication middleware in production.

## Examples

### 1. Get All Approved Components

```bash
curl http://localhost:3000/api/components?status=approved
```

**Response:**
```json
{
  "success": true,
  "count": 25,
  "components": [
    {
      "_id": "...",
      "componentId": "abc-123",
      "name": "React Awesome Components",
      "description": "A collection of awesome React components...",
      "category": "ui-component",
      "tags": ["react", "ui", "components"],
      "source": {
        "name": "github-trending",
        "url": "https://github.com/...",
        "fetchedAt": "2025-10-16T10:00:00.000Z"
      },
      "status": "approved",
      "isTrusted": true
    }
  ]
}
```

### 2. Get Only Trusted Components

```bash
curl "http://localhost:3000/api/components?trustedOnly=true&limit=10"
```

### 3. Search Components

```bash
curl "http://localhost:3000/api/components?search=react%20components"
```

### 4. Filter by Category

```bash
curl "http://localhost:3000/api/components?category=ui-component"
```

### 5. Get Pending Components for Review

```bash
curl http://localhost:3000/api/components/pending
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "components": [
    {
      "componentId": "xyz-789",
      "name": "New Component Library",
      "status": "pending",
      "isTrusted": false
    }
  ]
}
```

### 6. Approve a Component

```bash
curl -X POST http://localhost:3000/api/components/xyz-789/approve \
  -H "Content-Type: application/json" \
  -d '{
    "verifiedBy": "admin-john"
  }'
```

**Response:**
```json
{
  "success": true,
  "component": {
    "componentId": "xyz-789",
    "status": "approved",
    "verifiedBy": "admin-john",
    "verifiedAt": "2025-10-16T12:00:00.000Z"
  }
}
```

### 7. Reject a Component

```bash
curl -X POST http://localhost:3000/api/components/xyz-789/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Not relevant to frontend development"
  }'
```

### 8. Manually Trigger All Scrapers

```bash
curl -X POST http://localhost:3000/api/scraper/run
```

**Response:**
```json
{
  "success": true,
  "results": {
    "totalFetched": 50,
    "totalSaved": 35,
    "totalDuplicates": 10,
    "totalErrors": 5,
    "sources": {
      "github-trending": {
        "fetched": 25,
        "saved": 20,
        "duplicates": 3,
        "errors": 2
      },
      "dev-to": {
        "fetched": 25,
        "saved": 15,
        "duplicates": 7,
        "errors": 3
      }
    }
  }
}
```

### 9. Trigger Specific Scraper

```bash
curl -X POST http://localhost:3000/api/scraper/run \
  -H "Content-Type: application/json" \
  -d '{
    "source": "github-trending"
  }'
```

### 10. Get Scraper Status

```bash
curl http://localhost:3000/api/scraper/status
```

**Response:**
```json
{
  "success": true,
  "scrapers": [
    {
      "key": "github-trending",
      "name": "GitHub Trending",
      "frequency": "0 */6 * * *",
      "enabled": true
    },
    {
      "key": "dev-to",
      "name": "Dev.to",
      "frequency": "0 */12 * * *",
      "enabled": true
    }
  ]
}
```

### 11. Get Scheduler Status

```bash
curl http://localhost:3000/api/scheduler/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "jobs": [
      {
        "name": "main-scraper",
        "schedule": "0 */6 * * *"
      }
    ],
    "scrapers": [...]
  }
}
```

### 12. Get Statistics

```bash
curl http://localhost:3000/api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 250,
    "byStatus": [
      { "_id": "approved", "count": 200 },
      { "_id": "pending", "count": 45 },
      { "_id": "rejected", "count": 5 }
    ],
    "byCategory": [
      { "_id": "ui-component", "count": 100 },
      { "_id": "library", "count": 80 },
      { "_id": "pattern", "count": 40 },
      { "_id": "best-practice", "count": 30 }
    ],
    "bySource": [
      { "_id": "github-trending", "count": 120 },
      { "_id": "dev-to", "count": 80 },
      { "_id": "css-tricks", "count": 30 },
      { "_id": "smashing-magazine", "count": 20 }
    ],
    "trusted": 200
  }
}
```

### 13. Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T12:00:00.000Z",
  "database": "connected"
}
```

## Using the CLI Tool

The CLI tool provides a convenient way to interact with the API:

### List Components

```bash
node src/cli.js list approved
node src/cli.js list pending
```

### Get Pending Components

```bash
node src/cli.js pending
```

### Approve a Component

```bash
node src/cli.js approve abc123 admin-john
```

### Reject a Component

```bash
node src/cli.js reject xyz789 "Not relevant"
```

### Run Scrapers

```bash
# Run all scrapers
node src/cli.js run

# Run specific scraper
node src/cli.js run github-trending
```

### Get Statistics

```bash
node src/cli.js stats
```

### Get System Status

```bash
node src/cli.js status
```

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

> Note: Implement rate limiting in production to prevent abuse.

## Best Practices

1. **Pagination**: Use the `limit` parameter to control response size
2. **Filtering**: Combine multiple filters for precise queries
3. **Caching**: Cache frequently accessed data on the client side
4. **Error Handling**: Always check the `success` field in responses
5. **Trusted Sources**: Use `trustedOnly=true` for production applications

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function getApprovedComponents() {
  try {
    const response = await axios.get('http://localhost:3000/api/components', {
      params: {
        status: 'approved',
        trustedOnly: true,
        limit: 20
      }
    });
    return response.data.components;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Python

```python
import requests

def get_approved_components():
    url = 'http://localhost:3000/api/components'
    params = {
        'status': 'approved',
        'trustedOnly': 'true',
        'limit': 20
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        return data['components']
    else:
        print(f"Error: {response.status_code}")
        return None
```

### Frontend (React)

```javascript
import React, { useEffect, useState } from 'react';

function ComponentList() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/components?status=approved&trustedOnly=true')
      .then(res => res.json())
      .then(data => {
        setComponents(data.components);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {components.map(comp => (
        <div key={comp.componentId}>
          <h3>{comp.name}</h3>
          <p>{comp.description}</p>
        </div>
      ))}
    </div>
  );
}
```
