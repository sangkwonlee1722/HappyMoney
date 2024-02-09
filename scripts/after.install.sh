#!/bin/bash
cd /home/ubuntu/HappyMoney

/home/ubuntu/.nvm/versions/node/v20.11.0/bin/npm ci
/home/ubuntu/.nvm/versions/node/v20.11.0/bin/npm run build
/home/ubuntu/.nvm/versions/node/v20.11.0/bin/pm2 start dist/main.js --name api-server