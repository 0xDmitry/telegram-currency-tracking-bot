require('dotenv').config();
const { Telegraf } = require('telegraf');

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);

bot.start((ctx) => {
    ctx.reply('Hello ' + ctx.from.first_name + '!');
});

bot.on('text', (ctx) => {
    ctx.reply(ctx.message.text + " received!");
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));