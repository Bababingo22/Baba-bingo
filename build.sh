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

# FIX CARD IDs (The "No-Attribute-Error" version)
echo "Resetting Bingo Card IDs..."
python manage.py shell -c "from bingo.models import PermanentCard; data = list(PermanentCard.objects.values().order_by('id')); PermanentCard.objects.all().delete(); [PermanentCard.objects.create(**{k: v for k, v in item.items() if k != 'id'}) for item in data]; print('IDs Reset Success')"

# Create superuser
echo "Creating superuser..."
python manage.py create_superuser_from_env
