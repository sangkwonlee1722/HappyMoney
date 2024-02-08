!/bin/bash
sudo chmod -R 777 /home/ubuntu/HappyMoney // sudo 권한 부여

#navigate into our working directory
cd /home/ubuntu/HappyMoney 프로젝트 루트 경로 접근

#install node modules & update swagger & pm2 reload
sudo pm2 stop api-server