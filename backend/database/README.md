# Database artifacts

NearDrop uses **Knex migrations** as the source of truth for the PostgreSQL schema.

| Location | Role |
| -------- | ---- |
| `backend/src/database/migrations/` | Versioned migrations (run via `npm run migrate` from `backend/`) |
| `schema.sql` in this folder | **Reference** snapshot for readers / tools; regenerate or update manually when migrations change (optional) |
| `data/` in this folder | Optional local Postgres data directory docs (dev-only) |

Do **not** apply `schema.sql` instead of migrations in environments that must stay reproducible — always use Knex up/down.

See root `README.md` for creating the `neardrop` role and database.
