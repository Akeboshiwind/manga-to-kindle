import JSZip from 'jszip'

import d from 'debug'
const debug = d('mtk:zip');

export async function zipStream(pdfStream: NodeJS.ReadableStream, fileName: string): Promise<NodeJS.ReadableStream> {
    debug("Zipping pdf");

    // TODO: Change name
    // const dest = fs.createWriteStream(`${tempDirectory}/${fileName}.zip`);

    const zip = new JSZip();

    debug("Adding pdf to zip");
    zip.file(fileName, pdfStream);

    debug("Compressing zip");
    return zip.generateNodeStream({
        compression: "DEFLATE",
    });
}
