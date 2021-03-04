import JSZip from 'jszip'

import d from 'debug'
const debug = d('mtk:zip');

export async function zipStream(pdfStream: NodeJS.ReadableStream, fileName: string): Promise<NodeJS.ReadableStream> {
    debug("Zipping pdf");

    const zip = new JSZip();

    debug("Adding pdf to zip");
    zip.file(`${fileName}.pdf`, pdfStream);

    debug("Compressing zip");
    return zip.generateNodeStream({
        compression: "DEFLATE",
    });
}
