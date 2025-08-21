from rest_framework import serializers
from .models import Transaction, GameRound, User, PermanentCard
from django.contrib.auth import get_user_model

class TransactionSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source="get_type_display", read_only=True)
    class Meta:
        model = Transaction
        fields = ("id", "timestamp", "type", "type_display", "amount", "running_balance", "note")

# --- THIS IS THE CORRECTED SERIALIZER ---
class GameRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRound
        # We replace the old, invalid 'boards' and 'active_board_ids'
        # with the new 'active_card_numbers' field.
        fields = (
            "id", "agent", "created_at", "active_card_numbers", 
            "called_numbers", "total_calls", "status", "game_type", 
            "winning_pattern", "amount"
        )

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "username", "is_agent", "operational_credit", "commission_percentage")

class PermanentCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermanentCard
        fields = ('card_number', 'board')