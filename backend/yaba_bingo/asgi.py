backend/yaba_bingo/asgi.py

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

Move Django setup to the top

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yaba_bingo.settings")
django.setup()

Now it is safe to import other modules that depend on Django settings

from channels.auth import AuthMiddlewareStack
from bingo import routing as bingo_routing

application = ProtocolTypeRouter({
"http": get_asgi_application(),
"websocket": AuthMiddlewareStack(
URLRouter(
bingo_routing.websocket_urlpatterns
)
),
})