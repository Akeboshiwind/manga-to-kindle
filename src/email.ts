import nodemailer from 'nodemailer'
import SES from 'aws-sdk/clients/ses'
import { MangaInfo } from './manga'
import { config } from './config'

import d from 'debug'
const debug = d('mtk:email');

const ses = new SES();
const transporter = nodemailer.createTransport({
    SES: ses,
});

export async function emailMangaInfo(info: MangaInfo): Promise<void> {
    debug("Sending mangaInfo email")

    const text = `Chapter Id: ${info.chapterId}
Chapter Name: ${info.chapterName}
Page Count: ${info.pageCount}
Manga Name: ${info.mangaName}`;

    await transporter.sendMail({
        from: config.email.from,
        to: "olivershawmarshall@gmail.com",
        subject: "Manga Info",
        text,
    });
}
