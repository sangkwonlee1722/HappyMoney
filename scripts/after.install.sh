#!/bin/bash

# Node.js와 npm이 설치된 경로를 환경 변수로 설정
NODE_PATH="/home/ubuntu/.nvm/versions/node/v20.11.0/bin"
export PATH="$NODE_PATH:$PATH"

cd /home/ubuntu/HappyMoney

# npm 명령 실행
npm ci
npm run build