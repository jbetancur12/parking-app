#!/bin/bash
# =============================================================================
# DEPLOY GREEN - Zero Downtime Deployment
# =============================================================================
# This script deploys the GREEN version of the backend.
# Run this when BLUE is currently active.
# =============================================================================

set -e

COMPOSE_FILE="docker-compose.blue-green.yml"
COLOR="green"
CONTAINER="parking_server_green"

echo "🟢 Starting GREEN deployment..."

# 1. Build the new image
echo "📦 Building new $COLOR image..."
docker compose -f $COMPOSE_FILE build server-$COLOR

# 2. Start the new container (alongside the old one)
echo "🚀 Starting $COLOR container..."
docker compose -f $COMPOSE_FILE --profile $COLOR up -d server-$COLOR

# 3. Wait for healthcheck
echo "⏳ Waiting for healthcheck..."
sleep 10

# 4. Check health
echo "🏥 Checking health..."
HEALTH=$(docker exec $CONTAINER curl -sf http://localhost:3000/health || echo "FAILED")

if [[ "$HEALTH" == "FAILED" ]]; then
    echo "❌ Health check failed! Aborting deployment."
    docker compose -f $COMPOSE_FILE --profile $COLOR stop server-$COLOR
    exit 1
fi

echo "✅ $COLOR is healthy!"

# 5. Prompt to switch traffic
echo ""
echo "=========================================="
echo "🔄 READY TO SWITCH TRAFFIC"
echo "=========================================="
echo ""
echo "1. Edit nginx/conf.d/default.conf"
echo "2. Comment out 'server parking_server_blue:3000;'"
echo "3. Uncomment 'server parking_server_green:3000;'"
echo "4. Run: docker exec parking_nginx nginx -s reload"
echo ""
echo "After switching, run:"
echo "  docker compose -f $COMPOSE_FILE --profile blue stop server-blue"
echo ""
echo "🎉 GREEN deployment ready!"
