# Manga -> Kindle

A telegram bot to send manga from sites like mangadex to a kindle.

It does this by:
- Downloading the manga info
- Downloading the page images
- Bundling them into a PDF
- Emailing that to the kindle's email address

This bot runs in AWS Lambda and uses AWS SES to send the emails.
