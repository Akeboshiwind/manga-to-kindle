import fetch from 'node-fetch'
import { internalRetry } from './retry'

import d from 'debug'
const debug = d('mtk:download');


export async function downloadPages(pageLinks: string[]): Promise<Buffer[]> {
    debug("Downloading %d pages", pageLinks.length);

    // TODO: Try out writing these to disk
    //       Does this reduce memory usage? (measure)
    //       Potentially can drop lambda memory usage
    const imageBufPromises = pageLinks
        .map(link => {
            return internalRetry(async _bail => {
                debug("Downloading link: %s", link);
                const resp = await fetch(link);
                return await resp.buffer();
            },{
                retryLimitMessage: "Failed to download page image"
            });
        })

    return await Promise.all(imageBufPromises);
}
