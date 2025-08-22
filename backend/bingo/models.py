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

class PermanentCard(models.Model):
    card_number = models.PositiveSmallIntegerField(unique=True, help_text="The number printed on your physical card (e.g., 27)")
    b_col = models.CharField(max_length=20, help_text="5 numbers from the B column, separated by commas (e.g., 11,6,14,9,3)")
    i_col = models.CharField(max_length=20, help_text="5 numbers from the I column, separated by commas (e.g., 30,21,17,24,19)")
    n_col = models.CharField(max_length=20, help_text="4 numbers from the N column (the FREE space is automatic), separated by commas (e.g., 38,43,32,39)")
    g_col = models.CharField(max_length=20, help_text="5 numbers from the G column, separated by commas (e.g., 58,54,50,47,52)")
    o_col = models.CharField(max_length=20, help_text="5 numbers from the O column, separated by commas (e.g., 73,70,66,75,65)")
    board = models.JSONField(editable=False, null=True)

    def save(self, *args, **kwargs):
        b = [int(n.strip()) for n in self.b_col.split(',')]
        i = [int(n.strip()) for n in self.i_col.split(',')]
        n_raw = [int(n.strip()) for n in self.n_col.split(',')]
        g = [int(n.strip()) for n in self.g_col.split(',')]
        o = [int(n.strip()) for n in self.o_col.split(',')]
        n = n_raw[:2] + ["FREE"] + n_raw[2:]
        self.board = [b, i, n, g, o]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Phoenix Bingo Card #{self.card_number}"

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