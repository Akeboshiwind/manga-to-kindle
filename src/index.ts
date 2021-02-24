import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'
import api from 'mangadex-full-api'
import { config } from './config'
import d from 'debug'
const debug = d('manga_to_kindle');

const bot = new Telegraf(config.bot.token, {
  telegram: { webhookReply: true }
});

interface MangaInfo {
    chapterId: number,
    pageCount: number,
    chapterName: string,
    mangaName: string,
}

const client = api.agent.login(config.mangadex.username,
                               config.mangadex.password,
                               // Don't bother cacheing the login
                               false);

async function getMangaInfo(chapterId: number): Promise<MangaInfo> {

    await client;
    const chapter = await api.Chapter.get(chapterId);
    // @ts-ignore
    const manga = await api.Manga.get(chapter.parentMangaID)

    return {
        chapterId,
        // @ts-ignore
        chapterName: `${chapter.title} - ${chapter.chapter}`,
        // @ts-ignore
        pageCount: chapter.pages.length,
        // @ts-ignore
        mangaName: `${manga.title}`,
    }
}

// [^\s] matches things that aren't whitespace
// (\d*) matches a group of digits, which should be the chapter id
// So this regex matches mangades urls with chapters
const mangadexChapterRegex = /[^\s]*mangadex\.org\/chapter\/(\d*)[^\s]*/;

bot.hears(mangadexChapterRegex, async (ctx) => {
    // Get manga info
    debug("Mangadex chapter link detected");
    const chapterId = parseInt(ctx.match[1], 10);
    const mangaInfo = await getMangaInfo(chapterId);

    // Send message with manga info
    ctx.reply(`Chapter Id: ${mangaInfo.chapterId}
Chapter Name: ${mangaInfo.chapterName}
Page Count: ${mangaInfo.pageCount}
Manga Name: ${mangaInfo.mangaName}`);
});

export const handler = makeHandler(
    bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/')
);
