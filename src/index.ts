import { Telegraf } from 'telegraf'
import { Handler } from 'aws-lambda'

const token = process.env.BOT_TOKEN;

if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: true }
});

bot.start((ctx) => ctx.reply('Hello'));

export const handler: Handler = async (_event, _context) => {
    bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/');
};
