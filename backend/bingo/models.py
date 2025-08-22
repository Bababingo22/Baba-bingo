# --- CORRECTED GameRound MODEL ---
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

    # The flawed custom save method has been completely removed.
    # We now rely on Django's default, correct behavior.