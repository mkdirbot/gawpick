import csv
import sys

# Read participants from stdin
participants = sys.stdin.read().splitlines()

with open("participants.csv", "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Username", "User ID"])
    for participant in participants:
        writer.writerow(participant.split(','))