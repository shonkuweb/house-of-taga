#!/usr/bin/env bash

# ================================================================
# Automated Deployment Script for House of Taaga on VPS
# Stack: PostgreSQL 16 + Express REST API + React SPA Nginx
# Completely isolated for multi-project VPS deployment
# ================================================================

set -e

echo "=========================================="
echo " Starting House of Taaga Full-Stack Deploy"
echo " Stack: PostgreSQL + Node API + Web SPA   "
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed on this VPS."
    echo "Please install Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Load .env if present
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Set host port (default: 3050)
export PORT=${PORT:-3050}
echo "✓ Host Port configured: $PORT"

# Rebuild and launch containers
echo "✓ Rebuilding and launching Docker containers (Database, API, Web)..."
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# Wait for containers to be ready
echo "✓ Waiting for PostgreSQL and API to initialize..."
sleep 6

# Check Web health
if curl -s http://127.0.0.1:$PORT/healthz | grep -q "healthy"; then
    echo "✅ Web Nginx container is UP on port $PORT"
else
    echo "⚠️ Checking Web container logs:"
    docker logs --tail 20 houseoftaaga-web || true
fi

# Check API + PostgreSQL health
if curl -s http://127.0.0.1:$PORT/api/healthz | grep -q "connected"; then
    echo "✅ PostgreSQL Database & API are CONNECTED & HEALTHY"
    echo "=========================================="
    echo "🎉 Full-Stack House of Taaga is RUNNING!"
    echo "=========================================="
else
    echo "⚠️ Checking API container logs:"
    docker logs --tail 30 houseoftaaga-api || true
fi

echo ""
echo "Next Steps to link with your domain (e.g., demo.shonku.site):"
echo "1. Point DNS A-Record for your domain to your VPS IP."
echo "2. If using host Nginx as reverse proxy, configure proxy_pass to http://127.0.0.1:$PORT;"
echo "   sudo cp vps/demo.shonku.site.conf /etc/nginx/sites-available/"
echo "   sudo ln -sf /etc/nginx/sites-available/demo.shonku.site.conf /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo "3. Issue free SSL Certificate with Certbot:"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "Done! Your site is running on port $PORT"
