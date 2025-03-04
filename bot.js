const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

let participants = [];

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Giveaway Bot! Use /setup to configure your giveaway.");
});

bot.onText(/\/setup/, (msg) => {
    bot.sendMessage(msg.chat.id, "Let's set up your giveaway! What's the prize?");
});

bot.onText(/\/participate/, (msg) => {
    const user = msg.from;
    participants.push({ username: user.username, id: user.id });
    bot.sendMessage(msg.chat.id, `Thanks for participating, ${user.username}!`);
});

bot.onText(/\/draw/, (msg) => {
    if (participants.length === 0) {
        bot.sendMessage(msg.chat.id, "No participants yet!");
        return;
    }

    // Call Python script to select winners
    exec('python3 draw_winners.py', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(msg.chat.id, "Error selecting winners.");
            return;
        }
        const winners = stdout.trim().split('\n');
        bot.sendMessage(msg.chat.id, `Winners: ${winners.join(', ')}`);
    });
});

bot.onText(/\/export/, (msg) => {
    // Call Python script to export data
    exec('python3 export_data.py', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(msg.chat.id, "Error exporting data.");
            return;
        }
        bot.sendDocument(msg.chat.id, 'participants.csv');
    });
});