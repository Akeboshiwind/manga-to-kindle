#!/usr/bin/env node

const api = require("mangadex-full-api");


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
let chapter = client.then(async () => {
    return api.Chapter.get(args["chapter-id"]);
});



// >> Output

// The output format is:
// {title}
// {page urls}
chapter.then(async chapter => {
    console.log(chapter.title);
    console.log(chapter.pages.join("\n"));
});
