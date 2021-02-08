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



// >> Make request to mangadex api

let client = api.agent.login(args.username, args.password, false);

let manga_info = client
    .then(async () => {
        return api.Chapter.get(args["chapter-id"]);
    })
    .then(async chapter => {
        var manga = api.Manga.get(chapter.parentMangaID)
        return Promise.all([manga, chapter])
    });



// >> Output

let fileSafeName = str => {
    return str.replace(/[^a-z0-9 ]/gi, '').toLowerCase();
}

// The output format is:
// {title}
// {page urls}
manga_info
    .then(async values => {
        let manga = values[0];
        let chapter = values[1];

        let title = `${fileSafeName(manga.title)} - ${chapter.chapter}`;
        if (chapter.title)
            title += ` = ${fileSafeName(chapter.title)}`

        console.log(title);
        console.log(chapter.pages.join("\n"));
    });
