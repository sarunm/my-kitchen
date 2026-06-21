# Deployment Guide

## Overview

The Kitchen Order Tracker is deployed to three locations:
1. **Home Server (192.168.1.131)** - NestJS backend, Next.js frontend, PostgreSQL database
2. **Raspberry Pi 4** - Express.js lightweight dashboard
3. **iPad 6** - PWA (Progressive Web App) via Next.js frontend

## Home Server Deployment

### Prerequisites
- Docker & Docker Compose installed
- Port 3000, 3001, 5432 available
- Git installed

### Initial Setup

```bash
# Clone repository
git clone <repo-url> /opt/kitchen
cd /opt/kitchen

# Create environment files
mkdir -p backend/env
cat > backend/.env << EOF
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=kitchen_user
DB_PASSWORD=kitchen_pass
DB_NAME=kitchen_orders
NODE_ENV=production
EOF

# Initialize Docker services
docker-compose up -d

# Verify services
docker-compose ps
```

### Updating Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Monitoring

```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Check resource usage
docker stats

# Database backup
docker-compose exec postgres pg_dump -U kitchen_user kitchen_orders > backup.sql
```

---

## Raspberry Pi Deployment

### Prerequisites
- Raspberry Pi 4 Model B
- Node.js 18+ installed
- Internet connectivity

### Initial Setup

```bash
# SSH into Raspberry Pi
ssh pi@<pi-ip>

# Clone repository
git clone <repo-url> /home/pi/kitchen
cd /home/pi/kitchen/pi-dashboard

# Install dependencies
npm install

# Build
npm run build

# Create systemd service
sudo cat > /etc/systemd/system/kitchen-pi-dashboard.service << EOF
[Unit]
Description=Kitchen Pi Dashboard
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/kitchen/pi-dashboard
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable kitchen-pi-dashboard
sudo systemctl start kitchen-pi-dashboard

# Check status
sudo systemctl status kitchen-pi-dashboard
```

### Updating Raspberry Pi

```bash
# Pull latest code
cd /home/pi/kitchen
git pull origin main

# Rebuild Pi dashboard
cd pi-dashboard
npm install
npm run build

# Restart service
sudo systemctl restart kitchen-pi-dashboard
```

---

## iPad Setup

### Access the App

1. Open Safari on iPad
2. Navigate to `http://192.168.1.131:3000`
3. Tap Share button
4. Select "Add to Home Screen"
5. Name it "Kitchen Orders"
6. Tap "Add"

The app is now available as a PWA on your home screen.

### Updating on iPad

The iPad app automatically fetches the latest version when you open it (since it's served directly from the home server). Just refresh if needed.

---

## Jenkins CI/CD

### Prerequisites
- Jenkins server installed
- Git plugin installed
- Docker plugin installed
- SSH keys configured for home server and Raspberry Pi

### Pipeline Configuration

1. Create new Pipeline job in Jenkins
2. Set repository URL: `<git-repo-url>`
3. Set webhook trigger on push to `main` branch
4. Use `Jenkinsfile` from root directory

### Credentials Setup

```bash
# Add Docker Hub credentials
Jenkins → Manage Credentials → Add Credentials
- ID: docker-username
- Type: Username
- Username: <docker-hub-username>
- Password: <docker-hub-token>

# Add Raspberry Pi credentials
Jenkins → Manage Credentials → Add Credentials
- ID: pi-server-ip
- Type: Secret text
- Secret: <pi-ip-address>

# SSH Keys
# Copy SSH keys to Jenkins server:
# ~/.ssh/home-server (private key for home server)
# ~/.ssh/pi (private key for Raspberry Pi)
```

### Manual Pipeline Trigger

```bash
# Push to main to trigger deployment
git push origin main

# Or manually trigger via Jenkins UI
Jenkins → Kitchen Order Tracker → Build Now
```

### Monitoring CI/CD

```bash
# View Jenkins logs
tail -f /var/log/jenkins/jenkins.log

# Check Docker Hub for pushed images
docker pull <username>/kitchen-backend:latest
```

---

## Database Management

### Backup

```bash
# Full database backup
docker-compose exec postgres pg_dump -U kitchen_user kitchen_orders > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
docker-compose exec postgres pg_dump -U kitchen_user kitchen_orders | gzip > backup.sql.gz
```

### Restore

```bash
# Restore from backup
docker-compose exec -T postgres psql -U kitchen_user kitchen_orders < backup.sql
```

### Connect to Database

```bash
# From home server
docker-compose exec postgres psql -U kitchen_user kitchen_orders

# From remote host
psql -h 192.168.1.131 -U kitchen_user -d kitchen_orders
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Verify Docker installation
docker --version
docker-compose --version

# Check ports
netstat -tlnp | grep 3000
netstat -tlnp | grep 3001
```

### Database Connection Error

```bash
# Check database is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Verify credentials in .env
cat backend/.env
```

### Raspberry Pi Dashboard Not Updating

```bash
# SSH to Pi
ssh pi@<pi-ip>

# Check service status
sudo systemctl status kitchen-pi-dashboard

# View logs
sudo journalctl -u kitchen-pi-dashboard -f

# Check backend connectivity
curl http://192.168.1.131:3001/api/orders
```

### High CPU/Memory Usage

```bash
# Check Docker stats
docker stats

# Restart service
docker-compose restart <service>

# Check for zombie processes
docker-compose exec <service> ps aux
```

---

## Security Considerations

1. **Database Password**: Change `kitchen_pass` to a strong password in production
2. **CORS**: Configure CORS origins in `backend/src/main.ts` for production URLs
3. **SSL/TLS**: Use reverse proxy (nginx) with SSL certificates for HTTPS
4. **Environment Variables**: Never commit `.env` files to git
5. **Backups**: Regular database backups (daily recommended)
6. **Updates**: Keep Node.js, PostgreSQL, and Docker updated

---

## Performance Optimization

1. **Database Indexes**: Already configured on `status` and `createdAt`
2. **Caching**: Consider Redis for API response caching
3. **CDN**: Serve static assets through CDN for frontend
4. **Load Balancing**: Use nginx/HAProxy for multiple backend instances
5. **Monitoring**: Set up Prometheus + Grafana for metrics
