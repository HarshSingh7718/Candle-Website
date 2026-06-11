@echo off
echo Deploying...

:: Run remote commands over SSH using your alias
ssh api_naisha "cd ~/public_html && git pull origin main && cd Backend2 && npm ci --omit=dev && touch ~/public_html/tmp/restart.txt"

echo Deployed successfully
