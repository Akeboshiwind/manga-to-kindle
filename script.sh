#!/bin/sh


# >> Arguments

[ "$1" == "" ] && {
    cat << USAGE
usage: manga-to-kindle <chapter-id>
USAGE
    exit 1
}
chapter_id=$1

# TODO: Add retries
output="$(node --trace-warnings . --username Akeboshiwind --password $(gopass show --password personal/mangadex.org) --chapter-id $chapter_id)"
status=$?
[ $status -ne 0 ] && {
    echo "Failed to get chapter info from mangadex"
    exit 1
}
title="$(echo "$output" | head -n1)"
files="$(echo "$output" | tail -n +2)"

mkdir target
cd target

# Download each file individually
echo "$files" | xargs -n1 curl -O
cd ..

# Convert image to jpg to save on size
mkdir converted
mogrify -path converted -format jpg target/*
rm -rf target

convert $(echo "$files" | sed -E 's#.*/(.*)\..*#converted/\1.jpg#') "$title.pdf"

rm -rf converted

echo "PDF created at $title.pdf"
