@echo off
echo Deploying...

:: Run remote commands over SSH, adding the NVM folder to the PATH so npm can find node
ssh api_naisha "export PATH=/var/www/7a240458-fb47-42de-be89-6155cb6966f6/.nvm/versions/node/v26.3.0/bin:$PATH && cd ~/public_html && git pull origin main && cd Backend2 && npm ci --omit=dev && touch tmp/restart.txt"

echo Deployed successfully
