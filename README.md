# Quick Message Sender (WA Sender)

Arabic, RTL, mobile‑first app for sending **personalised WhatsApp messages** to a list of contacts, one tap at a time. Nothing is sent automatically and all data stays on the device (`localStorage`).

Built with React 19, Vite 7 and Tailwind v4. Ships as a **PWA** and as an **Android app** via Capacitor 7.

## Features

- **جهات الاتصال** — load the phone's address book (Capacitor contacts plugin), search, multi‑select, or add a number manually.
- **محرر البيانات** — spreadsheet‑style editor: add/rename/delete columns, edit cells, export CSV.
- **إرسال الرسائل** — write a template with `{الاسم}`‑style variables, then tap "إرسال" per row to open WhatsApp with the filled‑in message. Rows are marked as sent.

## Development

```bash
npm install
npm run dev        # web dev server
npm run build      # production build to dist/
npm run lint
```

## Android

```bash
npm run build:android   # vite build + cap sync android
npm run open:android    # open in Android Studio
```

## Notes

- Phone normalisation is Algeria‑specific: a leading `0` becomes `213…`.
- App id: `com.quickmsgsender.app`.
