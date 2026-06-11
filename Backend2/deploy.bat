@echo off
echo Deploying...

:: Run remote commands over SSH using your alias
ssh api_naisha "cd ~/public_html && git pull origin main && cd Backend2 && /var/www/7a240458-fb47-42de-be89-6155cb6966f6/.nvm/versions/node/v26.3.0/bin/npm ci --omit=dev && touch ~/public_html/tmp/restart.txt"

echo Deployed successfully
