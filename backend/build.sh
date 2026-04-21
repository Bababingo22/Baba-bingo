#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

echo "--- FORCING DATABASE TO READ EDITED CARDS ---"
python manage.py shell -c "import importlib.util; spec = importlib.util.spec_from_file_location('seed', 'bingo/migrations/0004_final_200_cards.py'); module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module); module.seed_200_perfect_cards(None, None); print('SUCCESS: CARDS UPDATED PERFECTLY')"

python manage.py create_superuser_from_env