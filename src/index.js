require('dotenv').config();
const { Telegraf } = require('telegraf');
const yahooFinance = require('yahoo-finance2').default;

const token = process.env.BOT_TOKEN;
const bot = new Telegraf(token);
const watchList = ['RUB=X', '^GSPC', 'BTC-USD', 'ETH-USD', 'SOL-USD'];

bot.start(async (ctx) => {
    ctx.reply('Hi! I am currency tracking bot. I will notify you about new prices every day at 21:00 UTC. Or you can receive actual prices immediately with "getLast" command.');
    const marketDataReport = await getMarketDataReport(watchList);
    ctx.reply(marketDataReport);

    var lastHours = new Date().getUTCHours();
    setInterval(async () => {
        const currentHours = new Date().getUTCHours();

        if (currentHours !== lastHours && currentHours === 21) {
            const marketDataReport = await getMarketDataReport(watchList);
            ctx.reply(marketDataReport);
        }

        lastHours = currentHours;
    }, 60000);
});

bot.command('getLast', async (ctx) => {
    const marketDataReport = await getMarketDataReport(watchList);
    ctx.reply(marketDataReport);
})

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const getMarketDataReport = async (symbols) => {
    let report = 'Last prices:\n\n'

    for (const symbol of symbols) {
        const now = new Date();
        const todayWithoutTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const startDate = new Date(todayWithoutTime.getTime() - 86400000 * 4);
        const queryOptions = { period1: startDate, interval: '1d' };
        const bars = await yahooFinance.historical(symbol, queryOptions);
        report += `${symbol}\n`;

        for (const bar of bars) {
            const day = bar.date.toLocaleDateString("en-US", { timeZone: 'UTC', day: 'numeric', month: 'short' });
            const price = (Math.round(bar.close * 100) / 100).toFixed(2);
            report += `${day}: ${price}\n`;
        }

        report += '\n';
    }

    return report;
}