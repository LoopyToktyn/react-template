#!/bin/sh
echo "Injecting runtime environment variables..."

envsubst < /usr/share/nginx/html/env-config.template.js > /usr/share/nginx/html/env-config.js

echo "Starting NGINX..."
exec nginx -g "daemon off;"
