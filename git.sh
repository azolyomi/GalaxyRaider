#/bin/sh
git fetch origin master

# Hard reset
git reset --hard origin/master

# Force pull
git pull origin master --force

# Restart app.js

pm2 restart app.js