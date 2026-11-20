# FitPulse — Vercel deployment (frontend + backend, ONE project)

## Structure
```
api/index.js      -> Vercel serverless entry (loads backend/server.js)
backend/          -> Express API (also runs locally: npm run dev:backend)
frontend/         -> Vite + React (built to frontend/dist)
package.json      -> backend dependencies for Vercel + build script
vercel.json       -> build, /api rewrite, SPA fallback, daily cron
```

## Deploy steps
1. Push to GitHub:  `git add . && git commit -m "vercel ready" && git push`
2. vercel.com -> Add New -> Project -> select the repo. Root Directory = `./`, Framework Preset = Other
   (build/output are already set in vercel.json). Do NOT override them.
3. Settings -> Environment Variables (Production):

| Variable        | Value                                                                 |
|-----------------|-----------------------------------------------------------------------|
| `MONGO_URI`     | MongoDB Atlas connection string (with database name)                  |
| `JWT_SECRET`    | long random string (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `NODE_ENV`      | `production`                                                          |
| `CRON_SECRET`   | any long random string (protects the reminder cron)                   |
| `FRONTEND_URL`  | (optional) your custom domain, e.g. `https://fitpulse.com`; used in email links |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | (optional) only if you want real verification / reset emails |

   Do NOT set `VITE_API_URL` and do NOT set `PORT`.
4. MongoDB Atlas -> Network Access -> add `0.0.0.0/0` (Vercel has no fixed IP).
5. Deploy. Test:
   - `https://YOUR-APP.vercel.app/api/health`  -> `{"status":"OK",...}`
   - open the site, register / log in.
6. First-time data (admin + demo users): run ONCE from your computer
   `npm run seed` (uses backend/.env -> Atlas).  WARNING: the seed script DELETES all existing data first.

## Notes
- API and frontend share one domain, so no CORS setup is needed (`ALLOWED_ORIGINS` is optional).
- Background reminder timer cannot run on Vercel. `/api/cron/reminders` is called by Vercel Cron once a day
  (Hobby plan limit). Reminders more than 6 hours late are skipped by design, so exact-time reminders need a
  Pro plan (change the schedule in vercel.json, e.g. `*/5 * * * *`) or an external pinger sending
  `Authorization: Bearer <CRON_SECRET>`.
- After changing an environment variable, Redeploy.

## Site Media (admin: /admin/media)

The admin can replace the home page hero video, hero poster, training-card pictures and a few other
photos without touching code.

- Uploaded files are stored in MongoDB (collection `sitemedias`), because Vercel functions have no writable disk.
  Nothing extra to configure; it uses the existing `MONGODB_URI`.
- Upload limit is 4 MB per file (Vercel rejects request bodies above ~4.5 MB). For a longer or heavier video,
  host it elsewhere and use the "Use link" option with a direct https:// link.
- "Reset" deletes the custom file/link and the site goes back to its built-in picture.
- Public endpoints: `GET /api/media` and `GET /api/media/:key`. Admin-only: `PUT /api/media/:key/upload`,
  `PUT /api/media/:key/link`, `DELETE /api/media/:key`.
