#!/bin/bash
# =============================================================================
# SWITCH TRAFFIC - Automated Blue-Green Switch
# =============================================================================
# Usage: ./scripts/switch-traffic.sh [blue|green]
# =============================================================================

set -e

if [ -z "$1" ]; then
    echo "Usage: ./scripts/switch-traffic.sh [blue|green]"
    exit 1
fi

TARGET=$1
CONF_FILE="nginx/conf.d/default.conf"

if [ "$TARGET" != "blue" ] && [ "$TARGET" != "green" ]; then
    echo "❌ Invalid target. Use 'blue' or 'green'"
    exit 1
fi

echo "🔄 Switching traffic to $TARGET..."

if [ "$TARGET" == "blue" ]; then
    # Activate blue, deactivate green
    sed -i 's/# server parking_server_blue:3000;/server parking_server_blue:3000;/' $CONF_FILE
    sed -i 's/server parking_server_green:3000;/# server parking_server_green:3000;/' $CONF_FILE
else
    # Activate green, deactivate blue
    sed -i 's/# server parking_server_green:3000;/server parking_server_green:3000;/' $CONF_FILE
    sed -i 's/server parking_server_blue:3000;/# server parking_server_blue:3000;/' $CONF_FILE
fi

# Reload nginx
echo "🔃 Reloading NGINX..."
docker exec parking_nginx nginx -s reload

echo "✅ Traffic switched to $TARGET!"
