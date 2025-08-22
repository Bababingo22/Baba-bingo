from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Transaction, GameRound, User, PermanentCard
from .serializers import TransactionSerializer, GameRoundSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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

# --- THIS IS THE FINAL, CORRECTED CreateGameView ---
class CreateGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        user = request.user
        if not user.is_agent:
            return Response({"detail": "Only agents can create games."}, status=status.HTTP_403_FORBIDDEN)
        
        bet_amount_per_card = request.data.get("amount") 
        active_cards = request.data.get("active_cards", [])
        
        if not active_cards or len(active_cards) < 3:
            return Response({"detail": "You must select at least 3 cards to start a game."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bet_amount_per_card = Decimal(bet_amount_per_card)
        except (TypeError, ValueError):
            return Response({"detail": "Invalid bet amount."}, status=status.HTTP_400_BAD_REQUEST)
        
        number_of_cards = len(active_cards)
        launch_cost = bet_amount_per_card * number_of_cards

        if user.operational_credit < launch_cost:
            return Response({
                "detail": f"Insufficient credit. Game Cost: {launch_cost}, Balance: {user.operational_credit}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.operational_credit = user.operational_credit - launch_cost
        user.save()
        
        game_type = request.data.get("game_type", "Regular")
        Transaction.objects.create(
            agent=user, type="GAME_LAUNCH", amount=-launch_cost,
            running_balance=user.operational_credit, note=f"Game launch cost for {game_type} with {number_of_cards} cards"
        )
        
        # --- THE FIX: Pass 'active_card_numbers' DIRECTLY into the create method ---
        game = GameRound.objects.create(
            agent=user, game_type=game_type,
            winning_pattern=request.data.get("winning_pattern", "Line"),
            amount=bet_amount_per_card,
            status="PENDING",
            active_card_numbers=active_cards
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

class PermanentCardDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, card_number):
        try:
            card = PermanentCard.objects.get(card_number=card_number)
            return Response({'card_number': card.card_number, 'board': card.board})
        except PermanentCard.DoesNotExist:
            return Response({"detail": "Card not found."}, status=status.HTTP_404_NOT_FOUND)

class GameHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.is_agent:
            return Response({"detail": "Only agents have a game history."}, status=status.HTTP_403_FORBIDDEN)
        games = GameRound.objects.filter(agent=request.user).order_by('-created_at')
        serializer = GameRoundSerializer(games, many=True)
        return Response(serializer.data)