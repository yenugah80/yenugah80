# Deployment Guide

This guide covers deploying FrontendDevAI to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring](#monitoring)
- [Backup and Recovery](#backup-and-recovery)

## Prerequisites

- Node.js v16 or higher
- MongoDB v4.4 or higher
- Git
- PM2 (for production)
- Docker (optional)

## Local Development

### 1. Setup

```bash
cd frontenddevai/backend
npm install
cp .env.example .env
```

### 2. Configure Environment

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/frontenddevai
SCRAPER_CRON_SCHEDULE=0 */6 * * *
```

### 3. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using local installation
mongod
```

### 4. Run Development Server

```bash
npm run dev
```

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/yourusername/frontenddevai.git
cd frontenddevai/backend

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env
```

### 3. Production Environment Variables

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/frontenddevai
SCRAPER_CRON_SCHEDULE=0 */6 * * *

# Security
GITHUB_TOKEN=your_production_token

# Sources
ENABLE_GITHUB_TRENDING=true
ENABLE_DEV_TO=true
ENABLE_CSS_TRICKS=true
ENABLE_SMASHING_MAGAZINE=true

# Settings
REQUIRE_ADMIN_APPROVAL=true
AUTO_APPROVE_FROM_TRUSTED_SOURCES=false
```

### 4. Start with PM2

```bash
# Start application
pm2 start src/index.js --name frontenddevai

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Monitor logs
pm2 logs frontenddevai

# Other PM2 commands
pm2 stop frontenddevai
pm2 restart frontenddevai
pm2 delete frontenddevai
```

### 5. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/frontenddevai
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/frontenddevai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Docker Deployment

### 1. Create Dockerfile

Create `frontenddevai/backend/Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Create docker-compose.yml

Create `frontenddevai/docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:4.4
    container_name: frontenddevai-mongo
    restart: always
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: frontenddevai-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/frontenddevai
      - PORT=3000
    depends_on:
      - mongodb
    volumes:
      - ./backend/.env:/app/.env

volumes:
  mongodb_data:
```

### 3. Deploy with Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## Cloud Deployment

### AWS (EC2 + MongoDB Atlas)

1. **Setup MongoDB Atlas**:
   - Create account at mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string
   - Add IP whitelist

2. **Launch EC2 Instance**:
   - Ubuntu 20.04 LTS
   - t2.small or larger
   - Configure security group (ports 22, 80, 443)

3. **Deploy Application**:
   ```bash
   # SSH to EC2
   ssh -i key.pem ubuntu@your-ec2-ip
   
   # Follow production deployment steps
   # Use MongoDB Atlas URI in .env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/frontenddevai
   ```

### Heroku

1. **Create Heroku App**:
   ```bash
   heroku create frontenddevai
   heroku addons:create mongolab:sandbox
   ```

2. **Create Procfile**:
   ```
   web: npm start
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   heroku logs --tail
   ```

### DigitalOcean

1. **Create Droplet**:
   - Ubuntu 20.04
   - At least 1GB RAM

2. **Setup MongoDB**:
   - Use MongoDB managed database
   - Or install on droplet

3. **Deploy**:
   - Follow production deployment steps
   - Use DigitalOcean's firewall

### Google Cloud Platform (GCP)

1. **Create VM Instance**:
   - Compute Engine
   - Ubuntu 20.04
   - e2-small or larger

2. **Setup Cloud MongoDB**:
   - Use MongoDB Atlas
   - Or Cloud SQL

3. **Deploy Application**:
   - Follow production deployment steps
   - Configure VPC firewall rules

## Environment Configuration

### Required Variables

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/frontenddevai
```

### Optional Variables

```env
SCRAPER_CRON_SCHEDULE=0 */6 * * *
SCRAPER_TIMEOUT=30000
GITHUB_TOKEN=your_token
ENABLE_GITHUB_TRENDING=true
ENABLE_DEV_TO=true
ENABLE_CSS_TRICKS=true
ENABLE_SMASHING_MAGAZINE=true
REQUIRE_ADMIN_APPROVAL=true
AUTO_APPROVE_FROM_TRUSTED_SOURCES=false
RATE_LIMIT_REQUESTS_PER_HOUR=100
```

## Monitoring

### Health Checks

```bash
# Manual check
curl http://localhost:3000/health

# Setup automated monitoring (example with uptime-kuma)
docker run -d -p 3001:3001 --name uptime-kuma louislam/uptime-kuma:1
```

### Logging

```bash
# PM2 logs
pm2 logs frontenddevai

# Docker logs
docker-compose logs -f backend

# System logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Metrics

Consider integrating:
- **New Relic** - Application performance monitoring
- **DataDog** - Infrastructure and application monitoring
- **Prometheus + Grafana** - Open-source monitoring

## Backup and Recovery

### MongoDB Backup

```bash
# Manual backup
mongodump --uri="mongodb://localhost:27017/frontenddevai" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/frontenddevai" /backup/20251016

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out=/backup/$DATE
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

### Automated Backups

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### Recovery Steps

1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application
5. Test functionality

## Security Best Practices

1. **Firewall**: Only expose necessary ports (80, 443)
2. **SSL/TLS**: Always use HTTPS in production
3. **Environment Variables**: Never commit `.env` to git
4. **Database**: Use strong passwords and authentication
5. **Updates**: Keep dependencies updated
6. **Monitoring**: Setup alerts for suspicious activity
7. **API Authentication**: Add authentication middleware
8. **Rate Limiting**: Implement rate limiting

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs frontenddevai

# Check port availability
sudo netstat -tlnp | grep 3000

# Check MongoDB
sudo systemctl status mongod
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongo --eval "db.adminCommand('ping')"

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### High Memory Usage

```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart frontenddevai

# Increase memory limit
pm2 start src/index.js --name frontenddevai --max-memory-restart 500M
```

## Scaling

### Horizontal Scaling

1. Deploy multiple instances
2. Use load balancer (Nginx, HAProxy)
3. Share MongoDB across instances
4. Configure session management

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize MongoDB queries
3. Add database indexes
4. Implement caching

## Maintenance

### Regular Tasks

1. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Database Maintenance**:
   ```bash
   mongo frontenddevai --eval "db.runCommand({compact: 'components'})"
   ```

3. **Log Rotation**:
   ```bash
   pm2 install pm2-logrotate
   ```

4. **Monitor Disk Space**:
   ```bash
   df -h
   du -sh /var/log
   ```

## Support

For deployment issues:
1. Check application logs
2. Review documentation
3. Open an issue on GitHub
4. Contact support team
