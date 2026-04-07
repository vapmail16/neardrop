# Local data (not committed)

| Path | Purpose |
| ---- | ------- |
| `pgdata/` | Optional dedicated PostgreSQL data directory for local development (e.g. `initdb` + `pg_ctl -D data/pgdata/...`). Gitignored. |

If you relocated an existing cluster, point `pg_ctl` (or your Postgres service) at the new path under `data/pgdata/`.
