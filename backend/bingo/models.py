from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import random
import json

class User(AbstractUser):
    is_agent = models.BooleanField(default=False)
    operational_credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_percentage = models.PositiveSmallIntegerField(default=settings.MIN_COMMISSION_PERCENTAGE,
                                                            validators=[MinValueValidator(settings.MIN_COMMISSION_PERCENTAGE),
                                                                        MaxValueValidator(settings.MAX_COMMISSION_PERCENTAGE)])

    def __str__(self):
        return f"{self.username} ({'Agent' if self.is_agent else 'User'})"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("MANUAL", "Manual Adjustment"),
        ("GAME_LAUNCH", "Game Launch Cost"),
        ("CREDIT", "Credit"),
        ("DEBIT", "Debit"),
    ]
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    timestamp = models.DateTimeField(default=timezone.now)
    type = models.CharField(max_length=32, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    running_balance = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.agent.username} {self.type} {self.amount} at {self.timestamp}"

def generate_single_board():
    board = []
    ranges = [(1,15), (16,30), (31,45), (46,60), (61,75)]
    for col_idx, (a,b) in enumerate(ranges):
        nums = random.sample(range(a, b+1), 5)
        if col_idx == 2:
            nums[2] = "FREE"
        board.append(nums)
    rows = [[board[col][row] for col in range(5)] for row in range(5)]
    return rows

# --- NEW MODEL ---
# This table will store your 100 permanent cards.
class PermanentCard(models.Model):
    card_number = models.PositiveSmallIntegerField(unique=True) # 1 through 100
    board = models.JSONField() # The B-I-N-G-O data

    def __str__(self):
        return f"Permanent Card #{self.card_number}"

# --- MODIFIED MODEL ---
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

    def save(self, *args, **kwargs):
        if not self.pk: # Only on first save
            self.active_card_numbers = list(range(1, 101))
        super().save(*args, **kwargs)