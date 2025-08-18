#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Step 1: Migrate the 'bingo' app FIRST. This creates the custom user table.
echo "Running bingo migrations..."
python manage.py migrate bingo

# Step 2: Migrate all other apps.
echo "Running remaining migrations..."
python manage.py migrate

# Step 3: Create the superuser.
echo "Creating superuser..."
python manage.py create_superuser_from_env