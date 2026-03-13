from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Existing endpoint (backward compatible)
    re_path(r'ws/restaurant/(?P<restaurant_id>[^/]+)/$', consumers.OrderConsumer.as_asgi()),
    
    # NEW: Kitchen-specific endpoint
    re_path(r'ws/kitchen/(?P<restaurant_id>[^/]+)/$', consumers.KitchenConsumer.as_asgi()),
]