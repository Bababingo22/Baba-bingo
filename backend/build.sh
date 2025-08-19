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