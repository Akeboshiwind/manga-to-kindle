import fetch from 'node-fetch'
import retry from 'async-retry'
import fs from 'fs'
import tempDirectory from 'temp-dir'
// import { config } from './config'

import d from 'debug'
const debug = d('mtk:download');

export async function downloadPages(pageLinks: string[]): Promise<string[]> {
    const filePaths = [];
    for (const link of pageLinks) {
        const pageFileName = link.split("/").slice(-1)[0];
        const dest = fs.createWriteStream(`${tempDirectory}/${pageFileName}`);

        retry(async _bail => {
            const res = await fetch(link);
            res.body.pipe(dest);
        },{
            onRetry: (err, attempt) => {
                debug("Retry (%d), got error %s", attempt, err);
        }});

        filePaths.push(dest.path.toString());
    }

    return filePaths;
}
