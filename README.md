Yaba Bingo - Full stack project
--------------------------------

Backend: Django + Channels
Frontend: React (Vite) + Tailwind
DB: PostgreSQL
Channel Layer: Redis

Deployment: Render.com (render.yaml provided)

Local setup (simplified):
- create Python venv
- pip install -r backend/requirements.txt
- setup DATABASE_URL (Postgres) and REDIS_URL environment variables
- python backend/manage.py migrate
- python backend/manage.py createsuperuser
- cd frontend && npm install && npm run dev
- Run daphne for ASGI: daphne -b 0.0.0.0 -p 8000 yaba_bingo.asgi:application

Important features:
- Super Admin uses Django Admin to manage Agents (User model has fields operational_credit and commission_percentage).
- Every manual adjustment in Admin generates a Transaction record.
- Agents create games via frontend; launching deducts Operational Credit and writes a Game Launch Cost transaction.
- /api/transactions/ returns the logged-in agent's transactions ordered newest-first.
- GameRunner uses browser speechSynthesis with lang 'am-ET'. Next number display updates only when speech ends.