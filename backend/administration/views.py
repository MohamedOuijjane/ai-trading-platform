from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from .models import BotConfig, Trade, Prediction

# --- STATS DASHBOARD ---
class StatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'users':       User.objects.count(),
            'trades':      Trade.objects.count(),
            'predictions': Prediction.objects.count(),
            'bots':        BotConfig.objects.filter(is_active=True).count(),
        })

# --- LISTE & CRÉATION ---
class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

# --- DÉTAIL, MODIFICATION, SUPPRESSION ---
class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

# --- ACTIVER / DÉSACTIVER ---
class UserToggleActiveView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response({
                'message': f"Utilisateur {'activé' if user.is_active else 'désactivé'}",
                'is_active': user.is_active
            })
        except User.DoesNotExist:
            return Response({'error': 'Introuvable'}, status=404)