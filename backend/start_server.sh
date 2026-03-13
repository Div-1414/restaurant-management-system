#!/bin/bash
cd /app/backend
exec /root/.venv/bin/daphne -b 0.0.0.0 -p 8001 restaurant_project.asgi:application
