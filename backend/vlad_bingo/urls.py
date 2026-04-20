from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # This handles the /api/ prefix
    path('api/', include('bingo.urls')),
]