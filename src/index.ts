import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'
import { config } from './config'
import * as manga from './manga'
import * as email from './email'
import * as download from './download'
import * as pdf from './pdf'
import * as zip from './zip'
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
    const info = await manga.getMangaInfo(chapterId);
    debug("Got manga info");

    const pageBuffs = await download.downloadPages(info.pageLinks);
    debug("Got pages");
    const pdfStream = await pdf.buildPDF(pageBuffs);
    debug("Got build pdf");
    // TODO: Change name
    const zipStream = await zip.zipStream(pdfStream, info.mangaName);
    debug("Got zip");

    await email.emailMangaPDF(zipStream, info);

    debug("Replying to message with chapter info");

    ctx.reply(format("%j", info));
});

bot.on('text', async (ctx) => {
    ctx.reply(`Did not recognise '${ctx.message.text}'`);
});

bot.catch(async (err, ctx) => {
    debug("Telegraf caught error, reporting to user %s", err);
    ctx.reply(`Failed with error: ${err}`)
});

export const handler = makeHandler(
    bot.webhookCallback(config.bot.hook_path)
);
