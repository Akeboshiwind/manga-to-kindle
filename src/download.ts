import fetch from 'node-fetch'
import { internalRetry } from './retry'

import d from 'debug'
const debug = d('mtk:download');


export async function downloadPages(pageLinks: string[]): Promise<Buffer[]> {
    debug("Downloading pages");
    const imageBuffs: Buffer[] = [];

    for (const link of pageLinks) {
        debug("Downloading link: %s", link);
        const pageBuf = await internalRetry(async _bail => {
            const resp = await fetch(link);
            return await resp.buffer();
        },{
            retryLimitMessage: "Failed to download page image"
        });

        imageBuffs.push(pageBuf);
    }

    debug("%d files downloaded", imageBuffs.length);
    return imageBuffs;
}
