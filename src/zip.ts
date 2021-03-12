import JSZip from 'jszip'

import d from 'debug'
const debug = d('mtk:zip');

export async function zipStream(pdfStream: NodeJS.ReadableStream, filename: string): Promise<NodeJS.ReadableStream> {
    debug("Zipping pdf");

    const zip = new JSZip();

    debug("Adding pdf to zip");
    zip.file(filename, pdfStream);

    debug("Compressing zip");
    return zip.generateNodeStream({
        compression: "DEFLATE",
    });
}
