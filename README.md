# AI Fundamentals: Endterm Book

Interactive 3D book for the AI Fundamentals endterm and exhibition. 24 pages: covers, front matter and 10 week spreads (lecture on the left, solved practice on the right).

Built by Amir Nagiyev, QAIRU AI & ML, Astana, 2026.

## Run locally

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Plain static site with no build step and no external requests. On Vercel: import the repository, framework preset "Other", no build command, output directory is the repository root.

## Layout

- `js/content.js`: all book text and traces
- `js/book.js`: page assembly and the 3D flip engine
- `js/review.js`: back-cover review widget (localStorage)
- `js/poster.js`: 1920x1080 exhibition card with QR code (Canvas)
- `vendor/`: KaTeX, qrcode-generator, IBM Plex fonts
