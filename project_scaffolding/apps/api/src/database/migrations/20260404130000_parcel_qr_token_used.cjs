/**
 * Phase 3: single-use collection QR (JWT stored on parcel row).
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.raw(`
    ALTER TABLE parcels
    ADD COLUMN IF NOT EXISTS qr_token_used_at TIMESTAMPTZ
  `);
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_parcels_qr_used ON parcels(qr_token_used_at) WHERE qr_token_used_at IS NOT NULL`,
  );
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_parcels_qr_used`);
  await knex.raw(`ALTER TABLE parcels DROP COLUMN IF EXISTS qr_token_used_at`);
};
