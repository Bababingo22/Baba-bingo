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
        if not active_cards or len(active_cards) < 3:
            return Response({"detail": "You must select at least 3 cards to start a game."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            bet_amount_per_card = Decimal(bet_amount_per_card)
        except (TypeError, ValueError, InvalidOperation):
            return Response({"detail": "Invalid bet amount."}, status=status.HTTP_400_BAD_REQUEST)

        number_of_cards = len(active_cards)
        launch_cost = bet_amount_per_card * number_of_cards

        # --- Charge only the agent commission, not the entire launch_cost ---
        commission_percentage = getattr(user, "commission_percentage", 0) or 0
        commission_amount = (launch_cost * Decimal(commission_percentage) / Decimal(100)).quantize(Decimal("0.01"))

        if user.operational_credit < commission_amount:
            return Response(
                {"detail": f"Insufficient credit. Commission: {commission_amount}, Your Balance: {user.operational_credit}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deduct only the commission from the agent's wallet
        user.operational_credit -= commission_amount
        user.save()

        game_type = request.data.get("game_type", "Regular")
        Transaction.objects.create(
            agent=user,
            type="GAME_LAUNCH",
            amount=-commission_amount,
            running_balance=user.operational_credit,
            note=f"Commission for game launch ({game_type}) with {number_of_cards} cards"
        )

        game = GameRound.objects.create(
            agent=user,
            game_type=game_type,
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

class GameHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.is_agent:
            return Response({"detail": "Only agents have a game history."}, status=status.HTTP_403_FORBIDDEN)
        games = GameRound.objects.filter(agent=request.user).order_by('-created_at')

        results = []
        for g in games:
            base_data = GameRoundSerializer(g).data
            # players_count = number of active cards
            try:
                players_count = len(g.active_card_numbers) if g.active_card_numbers else 0
            except Exception:
                players_count = 0
            try:
                total_bet_amount = (g.amount * Decimal(players_count)).quantize(Decimal("0.01")) if players_count else Decimal("0.00")
            except Exception:
                total_bet_amount = Decimal("0.00")
            commission_percentage = getattr(g.agent, "commission_percentage", 0) or 0
            try:
                profit = (total_bet_amount * Decimal(commission_percentage) / Decimal(100)).quantize(Decimal("0.01"))
            except Exception:
                profit = Decimal("0.00")
            base_data.update({
                "players_count": players_count,
                "total_bet_amount": str(total_bet_amount),
                "profit": str(profit)
            })
            results.append(base_data)

        return Response(results)

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

class ProfitReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user.is_agent:
            return Response({"detail": "Only agents can view profit reports."}, status=status.HTTP_403_FORBIDDEN)

        # Optional date range params (YYYY-MM-DD)
        start = request.query_params.get('start')
        end = request.query_params.get('end')

        qs = Transaction.objects.filter(agent=user, type__iexact='GAME_LAUNCH')
        if start:
            qs = qs.filter(timestamp__date__gte=start)
        if end:
            qs = qs.filter(timestamp__date__lte=end)

        # Aggregate per day from GAME_LAUNCH transactions (commissions)
        rows = {}
        for t in qs:
            d = t.timestamp.date()
            rows.setdefault(d, {"regular": Decimal("0.00"), "mtn": Decimal("0.00")})
            method = getattr(t, "method", None)
            # amount may be negative for debits; commission was created as negative in CreateGameView
            try:
                amt = Decimal(str(t.amount))
            except Exception:
                try:
                    amt = Decimal(t.amount or 0)
                except Exception:
                    amt = Decimal("0.00")
            # Commission to agent is the absolute of the debited amount
            commission_abs = (-amt) if amt < 0 else amt

            if method and str(method).upper() in ("MTN", "MOBILE", "MOMO"):
                rows[d]["mtn"] += commission_abs
            else:
                rows[d]["regular"] += commission_abs

        results = []
        for d in sorted(rows.keys(), reverse=True):
            regular = rows[d]["regular"].quantize(Decimal("0.01"))
            mtn = rows[d]["mtn"].quantize(Decimal("0.01"))
            total = (regular + mtn).quantize(Decimal("0.01"))
            results.append({
                "date": str(d),
                "regular_profit": str(regular),
                "mtn_profit": str(mtn),
                "total_profit": str(total)
            })

        return Response(results)