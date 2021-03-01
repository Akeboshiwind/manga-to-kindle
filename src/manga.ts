import api from 'mangadex-full-api'
import retry from 'async-retry'
import { config } from './config'

import d from 'debug'
const debug = d('mtk:manga');

export interface MangaInfo {
    chapterName: string,
    mangaName: string,
    pageLinks: string[],
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
    const chapter = await retry(async _bail => {
        return await api.Chapter.get(chapterId);
    }, {
        onRetry: (err, attempt) => {
            debug("Retry (%d), got error %s", attempt, err);
        }
    });

    const manga = await retry(async _bail => {
        // @ts-ignore
        return await api.Manga.get(chapter.parentMangaID)
    }, {
        onRetry: (err, attempt) => {
            debug("Retry (%d), got error %s", attempt, err);
        }
    });

    return {
        // @ts-ignore
        chapterName: `${chapter.title} - ${chapter.chapter}`,
        // @ts-ignore
        mangaName: `${manga.title}`,
        // @ts-ignore
        pageLinks: chapter.pages,
    }
}
