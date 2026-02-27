# ArchiFind Backend (PoC)

Simple Node.js + Express backend for ArchiFind.

Features
- Create professional profiles with image uploads (via `multipart/form-data`).
- Images stored in `server/uploads` and served statically at `/uploads/*`.
- Data persisted to `server/data/professionals.json` (PoC, no DB).

Quick start

1. Change to the `server` folder:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Run the server (port 5000):

```bash
npm start
```

API
- POST `/api/professionals` (multipart/form-data)
  - fields: `name` (required), `profession` (Architect|Interior Designer|Builder) (required), `phoneNumber` (required), `email`, `location`, `experience`, `bio`
  - files: `images` (up to 5)

- GET `/api/professionals` — list all professionals
- GET `/api/professionals/:id` — single professional

Notes
- This is a PoC — for production use a proper database and authentication.
