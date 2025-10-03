from rest_framework import serializers
from .models import Transaction, GameRound, User, PermanentCard
from django.contrib.auth import get_user_model

# ... (TransactionSerializer and UserSerializer are unchanged) ...

class TransactionSerializer(serializers.ModelSerializer):
    # ...
    pass
    
class UserSerializer(serializers.ModelSerializer):
    # ...
    pass

class GameRoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRound
        fields = (
            "id", "agent", "created_at", "active_card_numbers", 
            "called_numbers", "total_calls", "status", "game_type", 
            "winning_pattern", "amount",
            # *** NEW: Add the commission_percentage field ***
            "commission_percentage"
        )

# ... (PermanentCardSerializer is unchanged) ...
class PermanentCardSerializer(serializers.ModelSerializer):
    #...
    pass