from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.shortcuts import render
from .models import User, Transaction, GameRound, PermanentCard
from django.utils import timezone
from decimal import Decimal

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Agent info', {'fields': ('is_agent', 'operational_credit', 'commission_percentage')}),
    )
    list_display = ('username', 'is_agent', 'operational_credit', 'commission_percentage', 'is_staff')
    list_filter = BaseUserAdmin.list_filter + ('is_agent',)

    def save_model(self, request, obj, form, change):
        if change:
            try:
                old_obj = User.objects.get(pk=obj.pk)
                old_balance = old_obj.operational_credit
                new_balance = obj.operational_credit
                diff = (new_balance - old_balance)
                if diff != 0:
                    Transaction.objects.create(
                        agent=obj,
                        timestamp=timezone.now(),
                        type="MANUAL",
                        amount=diff,
                        running_balance=new_balance,
                        note=f"Manual adjustment by admin {request.user.username}"
                    )
            except User.DoesNotExist:
                pass
        super().save_model(request, obj, form, change)

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("agent", "timestamp", "type", "amount", "running_balance")
    list_filter = ("type", "timestamp")
    search_fields = ("agent__username",)

@admin.register(GameRound)
class GameRoundAdmin(admin.ModelAdmin):
    list_display = ("id", "agent", "created_at", "status", "game_type", "total_calls")
    readonly_fields = ("active_card_numbers", "called_numbers")

@admin.register(PermanentCard)
class PermanentCardAdmin(admin.ModelAdmin):
    list_display = ('card_number',)
    ordering = ('card_number',)
    actions = ['print_cards_action']

    def print_cards_action(self, request, queryset):
        from django.template.defaulttags import register
        @register.filter
        def getItem(list, index):
            return list[index]

        context = {'cards': queryset.order_by('card_number')}
        return render(request, 'admin/print_cards_template.html', context)

    print_cards_action.short_description = "Print Selected Cards"