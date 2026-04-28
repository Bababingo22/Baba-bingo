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
            if cell == "FREE" or cell == "★": continue
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
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.is_agent:
            return Response({"detail": "Only agents have transaction histories."}, status=status.HTTP_403_FORBIDDEN)
        qs = Transaction.objects.filter(agent=user).order_by("-timestamp")
        serializer = TransactionSerializer(qs, many=True)
        return Response(serializer.data)

class CreateGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        if not user.is_agent:
            return Response({"detail": "Only agents can create games."}, status=status.HTTP_403_FORBIDDEN)
        
        bet_amount_per_card = request.data.get("amount") 
        active_cards = request.data.get("active_cards", [])
        commission_percentage = request.data.get("commission_percentage", user.commission_percentage)

        if not active_cards or len(active_cards) < 3:
            return Response({"detail": "You must select at least 3 cards to start a game."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            bet_amount_per_card = Decimal(str(bet_amount_per_card))
            comm_pct = Decimal(str(commission_percentage))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid bet or commission amount."}, status=status.HTTP_400_BAD_REQUEST)
        
        # --- FIXED CALCULATION LOGIC ---
        # The agent collects the total bet amount from players
        total_collected = bet_amount_per_card * len(active_cards)
        
        # The system ONLY deducts the commission from the agent's balance
        commission_cost = total_collected * (comm_pct / Decimal('100'))
        
        if user.operational_credit < commission_cost:
            return Response({"detail": f"Insufficient credit. Commission Cost: {commission_cost}, Your Balance: {user.operational_credit}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct ONLY the commission
        user.operational_credit -= commission_cost
        user.save()
        
        game_type = request.data.get("game_type", "Regular")
        
        # Log the transaction clearly so the agent understands the charge
        Transaction.objects.create(
            agent=user, type="GAME_LAUNCH", amount=-commission_cost,
            running_balance=user.operational_credit, 
            note=f"{game_type} Commission ({len(active_cards)} cards at {bet_amount_per_card} ETB, {commission_percentage}%)"
        )
        
        game = GameRound.objects.create(
            agent=user, game_type=game_type,
            winning_pattern=request.data.get("winning_pattern", "Line"),
            amount=bet_amount_per_card, status="PENDING", active_card_numbers=active_cards,
            commission_percentage=commission_percentage
        )
        
        serializer = GameRoundSerializer(game)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class GameDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        game = get_object_or_404(GameRound, pk=pk)
        if request.user != game.agent and not request.user.is_staff:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        serializer = GameRoundSerializer(game)
        return Response(serializer.data)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class GameHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.is_agent:
            return Response({"detail": "Only agents have a game history."}, status=status.HTTP_403_FORBIDDEN)
        games = GameRound.objects.filter(agent=request.user).order_by('-created_at')
        serializer = GameRoundSerializer(games, many=True)
        return Response(serializer.data)

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
            'card_data': { 'card_number': card.card_number, 'board': card.board }
        })

# --- NEW: ADD LATE CARD VIEW ---
class AddCardToGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, game_id):
        user = request.user
        game = get_object_or_404(GameRound, pk=game_id)
        
        if game.agent != user:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
        card_num = request.data.get("card_number")
        if not card_num:
            return Response({"detail": "Card number required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            card_num = int(card_num)
        except ValueError:
            return Response({"detail": "Invalid card number."}, status=status.HTTP_400_BAD_REQUEST)
            
        if card_num in game.active_card_numbers:
            return Response({"detail": "Card already in this game."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not PermanentCard.objects.filter(card_number=card_num).exists():
            return Response({"detail": "Card does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
        # Deduct commission for exactly 1 late card
        comm_cost = Decimal(str(game.amount)) * (Decimal(str(game.commission_percentage)) / Decimal('100'))
        
        if user.operational_credit < comm_cost:
            return Response({"detail": "Insufficient credit for this card."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.operational_credit -= comm_cost
        user.save()
        
        # Add card to the game and save
        game.active_card_numbers.append(card_num)
        game.save()
        
        Transaction.objects.create(
            agent=user, type="LATE_CARD_ADD", amount=-comm_cost,
            running_balance=user.operational_credit, 
            note=f"Late card {card_num} added to Game #{game.id}"
        )
        
        # Return the updated game data so the frontend updates the prize pool!
        serializer = GameRoundSerializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)