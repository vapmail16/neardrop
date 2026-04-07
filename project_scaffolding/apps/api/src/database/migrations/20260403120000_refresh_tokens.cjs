/**
 * Phase 1 — refresh token rotation (JWT jti stored server-side).
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.raw(`
    CREATE TABLE refresh_tokens (
      id            UUID PRIMARY KEY,
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at    TIMESTAMPTZ NOT NULL,
      revoked_at    TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await knex.raw(`CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);`);
  await knex.raw(
    `CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens(user_id) WHERE revoked_at IS NULL;`,
  );
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.raw(`DROP TABLE IF EXISTS refresh_tokens;`);
};
