#!/bin/bash
cd /home/ubuntu/HappyMoney

npm ci
npm run build
pm2 start dist/main.js --name api-server