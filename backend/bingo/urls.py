from django.urls import path
from .views import (
    TransactionListView, 
    CreateGameView, 
    GameDetailView, 
    MyTokenObtainPairView, 
    CurrentUserView, 
    GameHistoryView,
    CheckWinView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("transactions/", TransactionListView.as_view(), name="transactions"),
    path("games/create/", CreateGameView.as_view(), name="create_game"),
    path("games/history/", GameHistoryView.as_view(), name="game_history"),
    path("games/<int:pk>/", GameDetailView.as_view(), name="game_detail"),
    path("me/", CurrentUserView.as_view(), name="me"),

    # --- THIS IS THE FINAL, CORRECT URL FOR THE WIN-CHECKER ---
    path("check_win/<int:game_id>/<int:card_number>/", CheckWinView.as_view(), name="check_win"),
]