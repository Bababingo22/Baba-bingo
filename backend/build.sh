#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Run migrations
echo "Running bingo migrations..."
python manage.py migrate bingo
echo "Running remaining migrations..."
python manage.py migrate

# Create superuser
echo "Creating superuser..."
python manage.py create_superuser_from_env

# Generate the 100 permanent cards if they don't exist
echo "Checking for permanent cards..."
python manage.py generate_cards