#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# --- FORCE RESET THE CARDS USING YOUR MIGRATION DATA ---
echo "Forcing Database to read 0004_final_200_cards..."
python manage.py shell -c "
from bingo.models import PermanentCard
from bingo.migrations.0004_final_200_cards import seed_200_perfect_cards
PermanentCard.objects.all().delete()
seed_200_perfect_cards(None, None)
print('SUCCESS: Database forcefully updated with 200 perfect cards.')
"

python manage.py create_superuser_from_env