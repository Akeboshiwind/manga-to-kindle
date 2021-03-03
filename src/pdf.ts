import PDFDocument from 'pdfkit'
import sizeOf from 'buffer-image-size'

import d from 'debug'
const debug = d('mtk:pdf');

const kindleDimensions = {
    width: 1264,
    height: 1680,
}

export async function buildPDF(pageBuffs: Buffer[]): Promise<NodeJS.ReadableStream> {
    debug("Building PDF");

    // TODO: Work out if PDF looks right with kindle settings
    const pdfDoc = new PDFDocument({
        autoFirstPage: false,
        size: [kindleDimensions.width, kindleDimensions.height],
        margin: 0,
    });

    if (pageBuffs.length === 0) {
        throw new Error("Can't have no pages to add to pdf");
    }

    debug("Adding images to PDF");
    for (const buff of pageBuffs) {
        const dimensions = sizeOf(buff);

        debug("Adding image to pdf");
        pdfDoc
            .addPage()
            .image(buff, {
                fit: [dimensions.width, dimensions.height],
                align: 'center',
                valign: 'center',
            });
    }

    pdfDoc.end();

    return pdfDoc;
}
