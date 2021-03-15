import nodemailer from 'nodemailer'
import SES from 'aws-sdk/clients/ses'
import { config } from './config'
import { Readable } from 'stream'

import d from 'debug'
const debug = d('mtk:email');

const ses = new SES();
const transporter = nodemailer.createTransport({
    SES: ses,
});

export async function emailStream(fileStream: NodeJS.ReadableStream, filename: string): Promise<void> {
    debug("Sending manga pdf email")

    await transporter.sendMail({
        from: config.email.from,
        to: config.email.to,
        // This fixes a bug where either:
        // - Nodemailer generates incorrect SMTP
        // - The kindle email client doesn't know how to parse this edge case
        // By inserting some text we can change the SMTP format slightly so
        // that the kindle will parse it.
        // See the following for a re-creation of the issue:
        // https://github.com/ake-temp/send-demo
        text: "fixes bug",
        attachments: [{
            filename,
            content: new Readable().wrap(fileStream),
        }]
    });
}
