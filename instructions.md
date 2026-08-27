# Stirling PDF

## Documentation

- [Stirling PDF documentation](https://docs.stirlingpdf.com) — the upstream guide to every tool, the settings file, and the API.

## What you get on StartOS

A single web interface with the whole Stirling PDF toolbox behind it — merge, split, rotate, compress, convert to and from Office and image formats, OCR scanned documents, fill and flatten forms, sign, redact, and chain any of it into a saved pipeline. Files are processed on your server and are not uploaded anywhere else.

Your settings, OCR language data, and saved pipelines are kept on the server and are included in StartOS backups.

Stirling PDF requires a sign-in, and this package generates the first account's password for you rather than leaving the instance open.

## Getting set up

1. Run **Set Admin Password** and copy the username and password it gives you. Stirling PDF will not start until you have done this, which is why it is the only thing you can press at first. **Save the password somewhere — it is shown once.**
2. Start Stirling PDF and wait for it to become ready. The first start takes a minute or two.
3. Open the **Web Interface** and sign in with those credentials.

## Using Stirling PDF

### Web interface

Signing in lands you on the tool list. Pick a tool, upload one or more PDFs, and download the result. Nothing you upload is retained after the operation finishes unless you save it to a pipeline.

Adding more users, and choosing what each of them may do, is done from **Settings → Admin** inside Stirling PDF.

### OCR languages

OCR needs a language pack for each language you want to recognise. Only English ships with the image. Add more from **Settings → OCR** inside Stirling PDF; they are stored on the server and survive restarts, updates, and restores.

### Actions

- **Set Admin Password** — generates a new password for the `admin` account and shows it once. Run it again whenever you want a fresh password or have lost the one you had; Stirling PDF applies the new one straight away and signs out anyone who is currently using it.

  If you change the `admin` password from inside Stirling PDF instead, this action can no longer replace it — StartOS no longer knows the current one, and the action will tell you so. Use Stirling PDF's own account tools from then on.
