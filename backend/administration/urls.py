from django.urls import path
from . import views

urlpatterns = [
    path('stats/',                 views.StatsView.as_view()),
    path('users/',                 views.UserListCreateView.as_view()),
    path('users/<int:pk>/',        views.UserDetailView.as_view()),
    path('users/<int:pk>/toggle/', views.UserToggleActiveView.as_view()),
]