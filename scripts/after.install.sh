#!/bin/bash
cd /home/ubuntu/HappyMoney

/usr/local/bin/npm ci
/usr/local/bin/npm run build
/usr/local/bin/pm2 start dist/main.js --name api-server