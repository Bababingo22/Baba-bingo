#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Run migrations first
python manage.py migrate

# Attempt to create superuser from environment variables
python manage.py create_superuser_from_env