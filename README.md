# essethr-backend

A Node.js backend application for the EssetHR human resource management platform.

## Prerequisites

- [Node.js](https://nodejs.org/) (see `.nvmrc` for a known-good version)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) **or** a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

## MongoDB with Docker (recommended for local dev)

From the **`hr-system`** folder (one level above `backend`), start MongoDB:

```bash
cd ..   # if you are inside backend/
docker compose up -d
```

This uses `docker-compose.yml` in **`hr-system`**, maps **`127.0.0.1:27017`**, and keeps data in a named volume.

Then in **`backend/.env`**:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=payrollex
```

Stop the database when you do not need it:

```bash
docker compose down
```

(To remove data as well: `docker compose down -v`.)

## Connect to the database

1. Copy the environment template and fill in values:

   ```bash
   cp .env.example .env
   ```

2. Set **`MONGODB_URI`** in `.env`:

   | Setup | Example |
   |--------|---------|
   | MongoDB on your machine | `MONGODB_URI=mongodb://127.0.0.1:27017` |
   | **Docker Compose** (from `hr-system`: `docker compose up -d`) | same URI as above |
   | One-off container | `docker run -d -p 27017:27017 --name mongo mongo:7` then use the same URI |
   | MongoDB Atlas | Use the **Connect → Drivers** SRV string; add user/password and IP allowlist |

3. Optional: **`MONGODB_DB_NAME`** (default: `payrollex`). The app uses `MongoClient` then `client.db(MONGODB_DB_NAME)`.

4. Start the API:

   ```bash
   npm install
   npm run dev
   ```

The server loads `.env` first thing (see `src/index.js`). If `NODE_ENV=production`, **`MONGODB_URI`** and **`JWT_SECRET` are required.**

### CORS (browser login / SPA on another origin)

Local dev defaults to permissive CORS (`Access-Control-Allow-Origin: *`). If the SPA is on `http://localhost:3000` and the API on `http://127.0.0.1:4000`, that mismatch is OK as long as the preflight OPTIONS response allows the browser’s origin — **restart `npm run dev` after pulling changes** so the running Node process picks up `src/app.js`. If you deploy publicly, set comma-separated **`CORS_ORIGINS`** (or **`CORS_ORIGIN`**) to your SPA URL(s).

## Scripts

- `npm start` — run with Node
- `npm run dev` — run with nodemon

## Dev login (empty database)

After MongoDB is running and `.env` is set, create a local admin for the frontend **Login** page (`/login` calls `POST /api/v1/users/login`):

```bash
npm run seed:dev
```

Default credentials (override with `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD` in `.env` if you want):

| Field | Value |
|-------|--------|
| Email | `admin@essethr.local` |
| Password | `DevAdmin123!` |

Re-running the seed does nothing if that email already exists.

## Security notes

- Do not commit `.env` (it is gitignored). Rotate any credentials that were ever committed to Git history.
- Change the dev password if you expose the API on a network; the seed password is for local use only.
