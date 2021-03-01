import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'
import { config } from './config'
import * as manga from './manga'
import * as email from './email'
import { format } from 'util'

import d from 'debug'
const debug = d('mtk:index');

const bot = new Telegraf(config.bot.token, {
  telegram: { webhookReply: true }
});

bot.hears(manga.chapterURLRegex, async (ctx) => {
    // Get manga info
    debug("Mangadex chapter link detected");
    const chapterId = parseInt(ctx.match[1], 10);
    const mangaInfo = await manga.getMangaInfo(chapterId);

    await email.emailMangaInfo(mangaInfo);

    debug("Replying to message with chapter info");
    // Send message with manga info
    ctx.reply(format("%j", mangaInfo));
});

export const handler = makeHandler(
    bot.webhookCallback(config.bot.hook_path)
);
