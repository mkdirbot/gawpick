import sys
import random

def draw_winners(num_winners):
    with open('participants.txt', 'r') as file:
        participants = file.read().splitlines()
    
    if len(participants) < num_winners:
        return "Not enough participants!"
    
    winners = random.sample(participants, num_winners)
    return '\n'.join([winner.split(',')[0] for winner in winners])

if __name__ == "__main__":
    num_winners = int(sys.argv[1])
    print(draw_winners(num_winners))