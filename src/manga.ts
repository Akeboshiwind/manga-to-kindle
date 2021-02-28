import api from 'mangadex-full-api'
import { config } from './config'

import d from 'debug'
const debug = d('mtk:manga');

export interface MangaInfo {
    chapterId: number,
    pageCount: number,
    chapterName: string,
    mangaName: string,
}

const client = api.agent.login(config.mangadex.username,
                               config.mangadex.password,
                               // Don't bother cacheing the login
                               false);

// [^\s] matches things that aren't whitespace
// (\d*) matches a group of digits, which should be the chapter id
// So this regex matches mangades urls with chapters
export const chapterURLRegex = /[^\s]*mangadex\.org\/chapter\/(\d*)[^\s]*/;

export async function getMangaInfo(chapterId: number): Promise<MangaInfo> {
    debug("Loading manga info")

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
