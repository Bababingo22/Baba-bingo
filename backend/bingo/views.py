from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Transaction, GameRound, User, PermanentCard
from .serializers import TransactionSerializer, GameRoundSerializer, UserSerializer
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

def check_win_condition(board, called_numbers, pattern="Line"):
    called_set = set(called_numbers)
    for row_idx in range(5):
        is_winner = True
        for col_idx in range(5):
            cell = board[col_idx][row_idx]
            if cell == "FREE": continue
            if cell not in called_set:
                is_winner = False
                break
        if is_winner: return True
    return False

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_agent"] = user.is_agent
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class TransactionListView(APIView):
    # ... (This view is correct) ...

class CreateGameView(APIView):
    # ... (This view is correct) ...

class GameDetailView(APIView):
    # ... (This view is correct) ...

class CurrentUserView(APIView):
    # ... (This view is correct) ...

class GameHistoryView(APIView):
    # ... (This view is correct) ...

# --- THIS IS THE FINAL, CONSOLIDATED WIN-CHECKER VIEW ---
class CheckWinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, game_id, card_number):
        try:
            game = GameRound.objects.get(pk=game_id)
            card = PermanentCard.objects.get(card_number=card_number)
        except (GameRound.DoesNotExist, PermanentCard.DoesNotExist):
            return Response({"detail": "Game or Card not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if card.card_number not in game.active_card_numbers:
            return Response({"detail": "This card is not active in the current game."}, status=status.HTTP_400_BAD_REQUEST)
            
        is_winner = check_win_condition(card.board, game.called_numbers, game.winning_pattern)
        
        return Response({
            'is_winner': is_winner,
            'card_data': {
                'card_number': card.card_number,
                'board': card.board
            }
        })