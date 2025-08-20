from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
# --- Add this import ---
from .models import Transaction, GameRound, User, PermanentCard
from .serializers import TransactionSerializer, GameRoundSerializer, UserSerializer
from rest_framework.decorators import api_view, permission_classes
from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# ... (keep all existing classes like MyTokenObtainPairView, TransactionListView, etc.) ...

# --- ADD THIS NEW CLASS TO THE END OF THE FILE ---
class PermanentCardDetailView(APIView):
    """
    An endpoint to get the data for a single permanent card by its number.
    This is used by the frontend's win-checker.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, card_number):
        try:
            card = PermanentCard.objects.get(card_number=card_number)
            return Response({'card_number': card.card_number, 'board': card.board})
        except PermanentCard.DoesNotExist:
            return Response({"detail": "Card not found."}, status=status.HTTP_404_NOT_FOUND)