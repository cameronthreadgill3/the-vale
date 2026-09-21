# Future character API (not wired yet)

The Vite SPA currently stores the four character slots in **Clerk `unsafeMetadata.valeCharacterSlots`** (or local demo storage when Clerk keys are absent).

When you are ready for a real DB:

1. Add Neon (or Vercel KV) via the Vercel marketplace.
2. Install `@clerk/backend` and a DB client.
3. Add serverless routes here, e.g. `api/characters.ts`, that:
   - verify the Clerk session with `CLERK_SECRET_KEY`
   - CRUD four slots per `userId` in Postgres
4. Point the client `AccountApp` persist/load helpers at these routes instead of Clerk metadata.

Keep `vercel.json` rewrites excluding `/api/*` once routes exist.
