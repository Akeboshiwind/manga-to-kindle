import nodemailer from 'nodemailer'
import { MangaInfo } from './manga'
import { config } from './config'

import d from 'debug'
const debug = d('mtk:email');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.email.email,
        pass: config.email.password,
    },
});

export async function emailMangaInfo(info: MangaInfo): Promise<void> {
    debug("Sending mangaInfo email")

    await transporter.sendMail({
        from: `${config.email.email}`,
        to: config.email.email,
        subject: "Manga Info",
        text: `Chapter Id: ${info.chapterId}
Chapter Name: ${info.chapterName}
Page Count: ${info.pageCount}
Manga Name: ${info.mangaName}`
    });
}
