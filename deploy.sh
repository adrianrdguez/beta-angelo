#!/bin/bash

cd /home/yeray/projects/beta-angelo
git pull --prune
./vendor/bin/sail npm install
./vendor/bin/sail npm run build
./vendor/bin/sail artisan migrate


