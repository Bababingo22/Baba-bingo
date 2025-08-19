from django.core.management.base import BaseCommand
from bingo.models import PermanentCard, generate_single_board
import json

class Command(BaseCommand):
    help = 'Generates and stores 100 unique, permanent bingo cards in the database.'

    def handle(self, *args, **options):
        if PermanentCard.objects.exists():
            self.stdout.write(self.style.WARNING('Permanent cards already exist. Aborting command.'))
            return

        self.stdout.write('Generating 100 unique permanent bingo cards...')
        
        cards = []
        seen_boards = set()
        
        while len(cards) < 100:
            board = generate_single_board()
            board_key = json.dumps(board, sort_keys=True, separators=(',', ':'))
            
            if board_key in seen_boards:
                continue
            
            seen_boards.add(board_key)
            card = PermanentCard(card_number=len(cards) + 1, board=board)
            cards.append(card)

        PermanentCard.objects.bulk_create(cards)
        
        self.stdout.write(self.style.SUCCESS('Successfully generated and stored 100 permanent cards.'))