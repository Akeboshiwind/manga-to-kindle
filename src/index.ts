import { Telegraf } from 'telegraf'
import makeHandler from 'lambda-request-handler'
import api from 'mangadex-full-api'

const token = process.env.BOT_TOKEN;
const mangadexUsername = process.env.MANGADEX_USERNAME;
const mangadexPassword = process.env.MANGADEX_PASSWORD;

if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

if (mangadexUsername === undefined) {
  throw new Error('MANGADEX_USERNAME must be provided!')
}

if (mangadexPassword === undefined) {
  throw new Error('MANGADEX_PASSWORD must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: true }
});

interface MangaInfo {
    chapterId: number,
    pageCount: number,
    chapterName: string,
    mangaName: string,
}

const client = api.agent.login(mangadexUsername, mangadexPassword, false);
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
    const chapterId = parseInt(ctx.match[1], 10);
    const mangaInfo = await getMangaInfo(chapterId);
    ctx.reply(`Chapter Id: ${mangaInfo.chapterId}
Chapter Name: ${mangaInfo.chapterName}
Page Count: ${mangaInfo.pageCount}
Manga Name: ${mangaInfo.mangaName}`);
});

export const handler = makeHandler(
    bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/')
);
