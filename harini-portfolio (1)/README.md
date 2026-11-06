# Harini R — Portfolio

Personal portfolio (Home, About, Skills, Experience, Projects, Feats, Resume, Contact) with a small Node/Express backend that powers the contact form.

```
portfolio/
├── frontend/          static site (HTML, CSS, JS, images)
│   ├── index.html
│   ├── css/           style.css, responsive.css (phone/tablet layer)
│   ├── js/            main.js, lightbox.js, contact.js, nav.js, config.js
│   └── assets/        images
├── backend/           Express API + static file server
│   ├── src/server.js  POST /api/contact, GET /api/health
│   ├── package.json
│   └── .env.example
└── render.yaml        one-click deploy on Render
```

## Run locally

```bash
cd backend
npm install
cp .env.example .env     # fill in SMTP details (optional for local testing)
npm start
```
Open http://localhost:3000. Without SMTP set, messages are saved to `backend/data/messages.jsonl`.

## Deploy

**Option A – everything on Render (simplest):** push to GitHub, create a Render Web Service from the repo (it reads `render.yaml`), add `SMTP_USER`, `SMTP_PASS`, `CONTACT_TO`. The backend serves the frontend, so leave `API_BASE` empty.

**Option B – frontend on GitHub Pages, backend on Render:** deploy `backend/` to Render, set `ALLOWED_ORIGINS` to your Pages URL, and set `window.API_BASE` in `frontend/js/config.js` to your Render URL.

## Features
- Responsive: hamburger menu up to 820px, tablet 2-column grids, no sideways scroll, 16px inputs (no iOS zoom)
- Light/dark theme, hash-routed pages, projects slider, image lightbox
- Contact form with validation, honeypot, rate limit (5 per 15 min), Helmet security headers
