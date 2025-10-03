from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator # <-- Make sure this is imported
from django.utils import timezone
import random
import json

# ... (User, Transaction, generate_single_board, PermanentCard models are unchanged) ...

class User(AbstractUser):
    #...
    pass

class Transaction(models.Model):
    #...
    pass

def generate_single_board():
    #...
    pass

class PermanentCard(models.Model):
    #...
    pass

class GameRound(models.Model):
    STATUS_CHOICES = [("PENDING", "Pending"), ("ACTIVE", "Active"), ("ENDED", "Ended")]
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_rounds")
    created_at = models.DateTimeField(default=timezone.now)
    active_card_numbers = models.JSONField(default=list) 
    called_numbers = models.JSONField(default=list)
    total_calls = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="PENDING")
    game_type = models.CharField(max_length=32, default="Regular")
    winning_pattern = models.CharField(max_length=64, default="Line")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # *** NEW: Add the commission percentage field for this specific game ***
    commission_percentage = models.PositiveSmallIntegerField(
        default=20, 
        validators=[MinValueValidator(20), MaxValueValidator(35)]
    )