!/bin/bash
sudo chmod -R 777 /home/ubuntu/HappyMoney

#navigate into our working directory
cd /home/ubuntu/HappyMoney

sudo npm ci
sudo npm run build
sudo pm2 reload api-server