#!/usr/bin/env node

const api = require("mangadex-full-api");

// Included because I think mangadex-full-api has an
// unhandledRejection of a promise
// NOTE: Hack
process.on('unhandledRejection', (reason, p) => {
    console.error(reason, p);
    process.exit(1);
});


// >> Parse arguments

let input_args = process.argv.slice(2);
let args = {
    "username": undefined,
    "password": undefined,
    "chapter-id": undefined,
};

for (var i=0; i<input_args.length; i++) {
    switch (input_args[i]) {
        case "--username":
            args.username = input_args[i+1];
            i++;
            break;
        case "--password":
            args.password = input_args[i+1];
            i++;
            break;
        case "--chapter-id":
            args["chapter-id"] = input_args[i+1];
            i++;
            break;
        default:
            console.error("Unknown argument " + input_args[i]);
    }
}

if (!args.username)
    throw new Error('missing required argument: --username');
if (!args.password)
    throw new Error('missing required argument: --password');
if (!args["chapter-id"])
    throw new Error('missing required argument: --chapter-id');


function fileSafeName(str) {
    return str.replace(/[^a-z0-9 ]/gi, '').toLowerCase();
}

async function main() {

    // >> Make request to mangadex api
    let client = await api.agent.login(args.username, args.password, false);

    let chapter = await api.Chapter.get(args["chapter-id"]);
    var manga = await api.Manga.get(chapter.parentMangaID)

    // >> Output

    // The output format is:
    // {title}
    // {page urls}
    let title = `${fileSafeName(manga.title)} - ${chapter.chapter}`;
    if (chapter.title)
        title += ` = ${fileSafeName(chapter.title)}`

    console.log(title);
    console.log(chapter.pages.join("\n"));
}

main()
