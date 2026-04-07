# Local data (not committed)

| Path | Purpose |
| ---- | ------- |
| `database/pgdata/` | Optional dedicated PostgreSQL data directory for local development (e.g. `initdb` + `pg_ctl -D database/pgdata/...`). Gitignored. |

If you relocated an existing cluster, point `pg_ctl` (or your Postgres service) at the new path under `database/pgdata/`.
