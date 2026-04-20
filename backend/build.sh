#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# Safe Card ID fix
python manage.py shell -c "from bingo.models import PermanentCard; cards = PermanentCard.objects.all().order_by('id'); [setattr(c, 'card_number', i) or c.save() for i, c in enumerate(cards, 1)]"

python manage.py create_superuser_from_env