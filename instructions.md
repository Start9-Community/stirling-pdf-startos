# Stirling PDF

## Documentation

- [Stirling PDF documentation](https://docs.stirlingpdf.com) — the upstream guide to every tool, the settings file, and the API.

## What you get on StartOS

A single web interface with the whole Stirling PDF toolbox behind it — merge, split, rotate, compress, convert to and from Office and image formats, OCR scanned documents, fill and flatten forms, sign, redact, and chain any of it into a saved pipeline. Files are processed on your server and are not uploaded anywhere else.

Your settings, OCR language data, saved pipelines, and any files you choose to keep on the server are included in StartOS backups.

Stirling PDF requires a sign-in, and this package generates the first account's password for you rather than leaving the instance open.

## Getting set up

1. Run **Set Admin Password** and copy the username and password it gives you. Stirling PDF will not start until you have done this, which is why it is the only thing you can press at first. **Save the password somewhere — it is shown once.**
2. Start Stirling PDF and wait for it to become ready. The first start takes a minute or two.
3. Open the **Web Interface** and sign in with those credentials.

## Using Stirling PDF

### Web interface

Signing in lands you on the tool list. Pick a tool, upload one or more PDFs, and download the result. Nothing you upload is retained on the server after the operation finishes unless you save it to a pipeline or turn on server file storage, described below.

Adding more users, and choosing what each of them may do, is done from **Settings → Admin** inside Stirling PDF. Stirling PDF's free tier covers up to five users, counting `admin`; going beyond that needs a paid plan from Stirling PDF.

### Keeping files on the server

Out of the box, the files in **My Files** are kept in your browser, so they are only there on the device you added them from. To keep them on your server instead, and open them from any device you sign in on, run **Enable Server File Storage**. Stirling PDF still labels this feature alpha.

Use that action rather than the switch of the same name inside Stirling PDF, which is reset the next time Stirling PDF starts.

### Inviting users by email

Run **Configure SMTP** first: choose the SMTP settings already configured under **System → SMTP** in StartOS, or enter a server of your own. Stirling PDF restarts, and its user-management page gains an invite option that emails each new user a link to set their own password. The link points at the address you were signed in on when you sent it, so send invitations from the address your users will reach Stirling PDF on.

An invited user's username is their full email address. That, not just the part before the `@`, is what they sign in with.

### OCR languages

OCR needs a language pack for each language you want to recognise. English, German, French, Portuguese and Simplified Chinese are included. To add more, sign in as `admin`, open **Settings**, go to the **Advanced** section, choose the languages under **Download additional tessdata languages**, and press **Download selected languages**. They are ready to use straight away, and they survive restarts, updates, and restores.

Leave the **Tessdata Directory** field on that page empty. Pointing it somewhere else moves new languages to a place that is not kept.

### Actions

- **Set Admin Password** — generates a new password for the `admin` account and shows it once. Run it again whenever you want a fresh password or have lost the one you had; Stirling PDF applies the new one straight away and signs out anyone who is currently using it.

  If you change the `admin` password from inside Stirling PDF instead, this action can no longer replace it — StartOS no longer knows the current one, and the action will tell you so. Use Stirling PDF's own account tools from then on.
- **Configure SMTP** — chooses how Stirling PDF sends email: not at all, through the StartOS system SMTP settings, or through a server you enter here. Saving restarts Stirling PDF.
- **Enable Server File Storage** / **Disable Server File Storage** — one action that switches between the two; its name tells you which way it will go. Switching it off keeps the files already stored, but nobody can open them until it is on again. Stirling PDF restarts.
