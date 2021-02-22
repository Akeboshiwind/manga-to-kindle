import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'

const token = process.env.BOT_TOKEN;

if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: true }
});

bot.start((ctx) => {
    console.log(ctx);
    console.log("Start Command");
    ctx.reply('Hello');
});

export const handler = makeHandler(
    bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/')
);
