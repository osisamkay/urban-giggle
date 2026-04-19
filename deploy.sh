#!/bin/bash

# ShareStake Autonomous Deployment Script
# This script handles the full lifecycle of the production build and deployment.

PROJECT_DIR="/data/apps/openclaw/workspace/urban-giggle"
LOG_FILE="$PROJECT_DIR/deploy.log"

echo "[$(date)] Starting deployment..." >> $LOG_FILE

# Navigate to project directory
cd $PROJECT_DIR || { echo "Project directory not found" >> $LOG_FILE; exit 1; }

# 1. Pull latest changes from master
echo "Pulling latest changes from GitHub..." >> $LOG_FILE
git pull origin master >> $LOG_FILE 2>&1

# 2. Build and restart the containers
echo "Building and restarting containers..." >> $LOG_FILE
docker compose up -d --build >> $LOG_FILE 2>&1

# 3. Health Check
echo "Verifying deployment..." >> $LOG_FILE
sleep 10
if curl -s http://localhost:3500 | grep -q "ShareStake"; then
    echo "✅ Deployment Successful: System is LIVE on port 3500" >> $LOG_FILE
else
    echo "❌ Deployment Failed: System is not responding" >> $LOG_FILE
    exit 1
fi

echo "[$(date)] Deployment completed successfully." >> $LOG_FILE
