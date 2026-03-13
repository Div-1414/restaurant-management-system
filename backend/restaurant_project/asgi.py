import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import restaurant_app.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'restaurant_project.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            restaurant_app.routing.websocket_urlpatterns
        )
    ),
})
