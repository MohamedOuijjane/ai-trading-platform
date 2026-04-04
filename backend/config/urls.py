from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('', lambda request: redirect('admin/', permanent=False)),
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/token/',         TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # API
    path('api/', include('administration.urls')),
    path('api/v1/', include('trading.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)