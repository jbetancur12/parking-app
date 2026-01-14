# =============================================================================
# BLUE-GREEN UPSTREAM CONFIGURATION
# =============================================================================
# This template is used by CI/CD to switch between blue/green deployments
# The ${ACTIVE_COLOR} placeholder is replaced by the deploy script
# =============================================================================

# Docker internal DNS resolver (required for dynamic upstream resolution)
resolver 127.0.0.11 valid=30s;

# ACTIVE BACKEND - Dynamically set during deployment
upstream api_backend {
    server parking_server_${ACTIVE_COLOR}:3000 resolve;
}

upstream client_frontend {
    server parking_client:80;
}

# API Server
server {
    listen 80;
    server_name api.localhost;  # Change to your domain

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://api_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

# Client App
server {
    listen 80;
    server_name app.localhost;  # Change to your domain

    location / {
        proxy_pass http://client_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Default - redirect to app
server {
    listen 80 default_server;
    server_name _;

    location / {
        return 301 http://app.localhost$request_uri;
    }
}
