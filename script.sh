#!/bin/sh

# TODO: Add retries
output="$(node .)"
title="$(echo $output | tr ' ' '\n' | head -n1)"
files="$(echo $output | tr ' ' '\n' | tail -n +2)"

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
