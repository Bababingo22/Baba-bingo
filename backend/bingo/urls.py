from django.urls import path
from . import views

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('transactions/', views.TransactionListView.as_view(), name='transactions'),
    path('games/create/', views.CreateGameView.as_view(), name='create_game'),
    path('games/history/', views.GameHistoryView.as_view(), name='game_history'),
    path('games/<int:pk>/', views.GameDetailView.as_view(), name='game_detail'),
    
    # NEW: Route for adding a late card in the Waiting Room
    path('games/<int:game_id>/add_card/', views.AddCardToGameView.as_view(), name='add_card_to_game'),
    
    # This now matches /api/check_win/43/2/
    path('check_win/<int:game_id>/<int:card_number>/', views.CheckWinView.as_view(), name='check_win'),
    path('profit_report/', views.TransactionListView.as_view(), name='profit_report'),
]