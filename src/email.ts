import nodemailer from 'nodemailer'
import SES from 'aws-sdk/clients/ses'
import { MangaInfo } from './manga'
import { config } from './config'
import { Readable } from 'stream'

import d from 'debug'
const debug = d('mtk:email');

const ses = new SES();
const transporter = nodemailer.createTransport({
    SES: ses,
});

export async function emailMangaPDF(zipStream: NodeJS.ReadableStream, filename: string): Promise<void> {
    debug("Sending mangaInfo email")

    await transporter.sendMail({
        from: config.email.from,
        to: "olivershawmarshall@gmail.com",
        subject: "Manga Info",
        attachments: [{
            filename,
            content: new Readable().wrap(zipStream),
        }]
    });
}
