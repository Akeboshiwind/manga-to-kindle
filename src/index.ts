import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'

const token = process.env.BOT_TOKEN;

if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: true }
});

// [^\s] matches things that aren't whitespace
// So this whole regex matches a whole mangadex url
const mangadex_regex = /[^\s]*mangadex\.org[^\s]*/;

bot.hears(mangadex_regex, (ctx) => {
    ctx.reply(`With match: ${ctx.match}`);
});

export const handler = makeHandler(
    bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/')
);
