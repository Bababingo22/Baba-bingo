from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import random

class User(AbstractUser):
    is_agent = models.BooleanField(default=False)
    operational_credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_percentage = models.PositiveSmallIntegerField(
        default=settings.MIN_COMMISSION_PERCENTAGE,
        validators=[
            MinValueValidator(settings.MIN_COMMISSION_PERCENTAGE),
            MaxValueValidator(settings.MAX_COMMISSION_PERCENTAGE)
        ]
    )
    def __str__(self):
        return f"{self.username} ({'Agent' if self.is_agent else 'User'})"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("MANUAL", "Manual Adjustment"),
        ("GAME_LAUNCH", "Game Launch Cost"),
        ("LATE_CARD_ADD", "Late Card Addition"), # Added to match views.py
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

class PermanentCard(models.Model):
    card_number = models.PositiveSmallIntegerField(unique=True)
    board = models.JSONField()

    def __str__(self):
        return f"Permanent Card #{self.card_number}"

class GameRound(models.Model):
    STATUS_CHOICES = [("PENDING", "Pending"), ("ACTIVE", "Active"), ("ENDED", "Ended")]
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_rounds")
    created_at = models.DateTimeField(default=timezone.now)
    active_card_numbers = models.JSONField(default=list) 
    called_numbers = models.JSONField(default=list) # Used for the offline sequence
    total_calls = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="PENDING")
    game_type = models.CharField(max_length=32, default="Regular")
    winning_pattern = models.CharField(max_length=64, default="Line")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission_percentage = models.PositiveSmallIntegerField(
        default=20, 
        validators=[MinValueValidator(20), MaxValueValidator(35)]
    )

    def __str__(self):
        return f"Game #{self.id} by {self.agent.username}"