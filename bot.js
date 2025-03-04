const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

let participants = [];
let raffleActive = false;

// Command: /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "🎉 Welcome to the Raffle Bot! Use /raffle to start a new raffle.");
});

// Command: /raffle
bot.onText(/\/raffle/, (msg) => {
    if (raffleActive) {
        bot.sendMessage(msg.chat.id, "A raffle is already active. Use /participate to join!");
        return;
    }

    participants = []; // Reset participants
    raffleActive = true;

    bot.sendMessage(
        msg.chat.id,
        "🎉 **Raffle has begun!**\n\nPress the button below to participate. The winner will be randomly selected when an admin uses /draw.",
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Participate", callback_data: "participate" }]
                ]
            }
        }
    );
});

// Handle participation
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const user = query.from;

    if (query.data === "participate") {
        if (participants.some(p => p.id === user.id)) {
            bot.answerCallbackQuery(query.id, { text: "You've already participated!" });
        } else {
            participants.push({ username: user.username, id: user.id });
            bot.answerCallbackQuery(query.id, { text: "Thanks for participating!" });
            bot.sendMessage(chatId, `🎉 @${user.username} has joined the raffle!`);
        }
    }
});

// Command: /draw
bot.onText(/\/draw/, (msg) => {
    if (!raffleActive) {
        bot.sendMessage(msg.chat.id, "No active raffle. Use /raffle to start one.");
        return;
    }

    if (participants.length === 0) {
        bot.sendMessage(msg.chat.id, "No participants yet!");
        return;
    }

    // Select a random winner
    const winner = participants[Math.floor(Math.random() * participants.length)];
    bot.sendMessage(
        msg.chat.id,
        `🎉 **The winner is — @${winner.username}!**\n\nCongratulations! 🎊`
    );

    // Reset raffle
    raffleActive = false;
    participants = [];
});

// Command: /participants
bot.onText(/\/participants/, (msg) => {
    if (participants.length === 0) {
        bot.sendMessage(msg.chat.id, "No participants yet!");
        return;
    }

    const participantList = participants.map(p => `@${p.username}`).join('\n');
    bot.sendMessage(msg.chat.id, `**Participants:**\n${participantList}`);
});

// Command: /search
bot.onText(/\/search (.+)/, (msg, match) => {
    const username = match[1].replace('@', ''); // Remove @ from username
    const participant = participants.find(p => p.username === username);

    if (participant) {
        bot.sendMessage(msg.chat.id, `✅ @${username} is in the participants list!`);
    } else {
        bot.sendMessage(msg.chat.id, `❌ @${username} is not in the participants list.`);
    }
});

// Command: /broadcast
bot.onText(/\/broadcast/, (msg) => {
    if (participants.length === 0) {
        bot.sendMessage(msg.chat.id, "No participants to broadcast to.");
        return;
    }

    const broadcastMessage = msg.text.replace('/broadcast', '').trim();
    if (!broadcastMessage) {
        bot.sendMessage(msg.chat.id, "Please provide a message to broadcast.");
        return;
    }

    participants.forEach(participant => {
        bot.sendMessage(participant.id, `📢 **Broadcast:**\n${broadcastMessage}`);
    });

    bot.sendMessage(msg.chat.id, "Broadcast sent to all participants.");
});

// Handle inline queries for channel participation
bot.on('inline_query', (query) => {
    const user = query.from;

    if (raffleActive) {
        if (participants.some(p => p.id === user.id)) {
            bot.answerInlineQuery(query.id, [{
                type: 'article',
                id: '1',
                title: 'You are already participating!',
                input_message_content: {
                    message_text: "You've already joined the raffle!"
                }
            }]);
        } else {
            participants.push({ username: user.username, id: user.id });
            bot.answerInlineQuery(query.id, [{
                type: 'article',
                id: '1',
                title: 'Thanks for participating!',
                input_message_content: {
                    message_text: `🎉 @${user.username} has joined the raffle!`
                }
            }]);
        }
    } else {
        bot.answerInlineQuery(query.id, [{
            type: 'article',
            id: '1',
            title: 'No active raffle.',
            input_message_content: {
                message_text: "There is no active raffle. Use /raffle to start one."
            }
        }]);
    }
});