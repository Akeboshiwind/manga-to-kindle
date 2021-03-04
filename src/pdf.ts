import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content, ContentImage } from 'pdfmake/interfaces'

import d from 'debug'
const debug = d('mtk:pdf');

const kindleDimensions = {
    width: 1264,
    height: 1680,
}

const printer = new PdfPrinter({});

export async function buildPDF(pageBuffs: Buffer[]): Promise<NodeJS.ReadableStream> {
    debug("Building PDF");

    if (pageBuffs.length === 0) {
        throw new Error("Can't have no pages to add to pdf");
    }

    const pageOjbs: Content[] = [];

    debug("Adding images to PDF");
    for (const buff of pageBuffs) {
        debug("Converting pagebuff to base64");
        // const dimensions = sizeOf(buff);
        const base64Data = buff.toString('base64');

        debug("Adding image to page description");
        // TODO: Work out if PDF looks right with kindle settings
        const page: ContentImage = {
            // TODO: Do mime type detection
            image: `data:image/png;base64,${base64Data}`,
            fit: [kindleDimensions.width, kindleDimensions.height],
        }

        pageOjbs.push(page);
    }

    debug("Creating pdf description");
    const docDef: TDocumentDefinitions = {
        pageSize: kindleDimensions,
        pageMargins: 0,
        content: pageOjbs,
    };

    debug("Creating pdf");
    const pdfDoc = printer.createPdfKitDocument(docDef);

    pdfDoc.end();

    return pdfDoc;
}
