/**
 * Full MVP schema (NearDrop MVP Implementation Plan §6).
 * Migrations use .cjs so `knex migrate` runs without a TS build step.
 */

/**
 * @param { import('knex').Knex } knex
 */
exports.up = async function up(knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  await knex.raw(`
    CREATE TABLE users (
      id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email          VARCHAR(255) NOT NULL UNIQUE,
      password_hash  VARCHAR(255) NOT NULL,
      first_name     VARCHAR(100) NOT NULL,
      last_name      VARCHAR(100) NOT NULL,
      role           VARCHAR(20) NOT NULL CHECK (role IN ('carrier', 'customer', 'affiliate', 'ops')),
      phone          VARCHAR(20),
      postcode       VARCHAR(10),
      is_active      BOOLEAN NOT NULL DEFAULT true,
      email_verified BOOLEAN NOT NULL DEFAULT false,
      last_login_at  TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_users_email ON users(email);`);
  await knex.raw(`CREATE INDEX idx_users_role ON users(role);`);
  await knex.raw(`CREATE INDEX idx_users_postcode ON users(postcode);`);

  await knex.raw(`
    CREATE TABLE affiliates (
      id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id              UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      postcode             VARCHAR(10) NOT NULL,
      address_line_1       VARCHAR(255) NOT NULL,
      address_line_2       VARCHAR(255),
      city                 VARCHAR(100) NOT NULL DEFAULT 'London',
      max_daily_capacity   INTEGER NOT NULL DEFAULT 20 CHECK (max_daily_capacity > 0),
      current_load         INTEGER NOT NULL DEFAULT 0 CHECK (current_load >= 0),
      is_available         BOOLEAN NOT NULL DEFAULT true,
      verification_status  VARCHAR(20) NOT NULL DEFAULT 'pending'
                           CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
      latitude             DECIMAL(10, 8),
      longitude            DECIMAL(11, 8),
      total_earnings       DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      rating               DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
      created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);`);
  await knex.raw(`CREATE INDEX idx_affiliates_postcode ON affiliates(postcode);`);
  await knex.raw(
    `CREATE INDEX idx_affiliates_available ON affiliates(is_available, verification_status);`,
  );

  await knex.raw(`
    CREATE TABLE carriers (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      company_name  VARCHAR(255) NOT NULL,
      api_tier      VARCHAR(10) NOT NULL DEFAULT 'tier_3'
                    CHECK (api_tier IN ('tier_1', 'tier_2', 'tier_3')),
      is_active     BOOLEAN NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_carriers_user_id ON carriers(user_id);`);

  await knex.raw(`
    CREATE TABLE parcels (
      id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      carrier_id            UUID NOT NULL REFERENCES carriers(id) ON DELETE RESTRICT,
      carrier_ref           VARCHAR(100),
      affiliate_id          UUID REFERENCES affiliates(id) ON DELETE SET NULL,
      customer_id           UUID REFERENCES users(id) ON DELETE SET NULL,
      recipient_name        VARCHAR(200) NOT NULL,
      recipient_postcode    VARCHAR(10) NOT NULL,
      recipient_email       VARCHAR(255),
      status                VARCHAR(30) NOT NULL DEFAULT 'manifest_received'
                            CHECK (status IN (
                              'manifest_received',
                              'in_transit',
                              'dropped_at_affiliate',
                              'ready_to_collect',
                              'collected',
                              'exception'
                            )),
      estimated_drop_time   TIMESTAMPTZ,
      actual_drop_time      TIMESTAMPTZ,
      collection_time       TIMESTAMPTZ,
      proof_of_drop_data    TEXT,
      collection_qr_token   VARCHAR(500),
      qr_token_expires_at   TIMESTAMPTZ,
      exception_type        VARCHAR(20) CHECK (exception_type IN (
                              'damaged', 'wrong_item', 'no_show', 'refused', 'lost'
                            )),
      exception_note        TEXT,
      per_parcel_fee        DECIMAL(6, 2) NOT NULL DEFAULT 0.50,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_parcels_carrier_id ON parcels(carrier_id);`);
  await knex.raw(`CREATE INDEX idx_parcels_affiliate_id ON parcels(affiliate_id);`);
  await knex.raw(`CREATE INDEX idx_parcels_customer_id ON parcels(customer_id);`);
  await knex.raw(`CREATE INDEX idx_parcels_status ON parcels(status);`);
  await knex.raw(`CREATE INDEX idx_parcels_recipient_postcode ON parcels(recipient_postcode);`);
  await knex.raw(`CREATE INDEX idx_parcels_qr_token ON parcels(collection_qr_token);`);

  await knex.raw(`
    CREATE TABLE parcel_status_history (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      parcel_id   UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
      status      VARCHAR(30) NOT NULL,
      actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
      actor_role  VARCHAR(20),
      note        TEXT,
      metadata    JSONB DEFAULT '{}',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(
    `CREATE INDEX idx_parcel_history_parcel_id ON parcel_status_history(parcel_id);`,
  );
  await knex.raw(`CREATE INDEX idx_parcel_history_status ON parcel_status_history(status);`);
  await knex.raw(`CREATE INDEX idx_parcel_history_created ON parcel_status_history(created_at);`);

  await knex.raw(`
    CREATE TABLE affiliate_earnings (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      affiliate_id    UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      parcel_id       UUID NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
      amount          DECIMAL(6, 2) NOT NULL CHECK (amount > 0),
      payout_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
      payout_date     TIMESTAMPTZ,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_earnings_affiliate_id ON affiliate_earnings(affiliate_id);`);
  await knex.raw(`CREATE INDEX idx_earnings_payout_status ON affiliate_earnings(payout_status);`);

  await knex.raw(`
    CREATE TABLE notifications (
      id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parcel_id  UUID REFERENCES parcels(id) ON DELETE SET NULL,
      channel    VARCHAR(10) NOT NULL DEFAULT 'email'
                 CHECK (channel IN ('email', 'push', 'sms')),
      type       VARCHAR(50) NOT NULL,
      subject    VARCHAR(255),
      body       TEXT NOT NULL,
      sent_at    TIMESTAMPTZ,
      status     VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await knex.raw(`CREATE INDEX idx_notifications_user_id ON notifications(user_id);`);
  await knex.raw(`CREATE INDEX idx_notifications_status ON notifications(status);`);

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER trg_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);
  await knex.raw(`
    CREATE TRIGGER trg_affiliates_updated_at
      BEFORE UPDATE ON affiliates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);
  await knex.raw(`
    CREATE TRIGGER trg_carriers_updated_at
      BEFORE UPDATE ON carriers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);
  await knex.raw(`
    CREATE TRIGGER trg_parcels_updated_at
      BEFORE UPDATE ON parcels
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  `);
};

/**
 * @param { import('knex').Knex } knex
 */
exports.down = async function down(knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_parcels_updated_at ON parcels;`);
  await knex.raw(`DROP TRIGGER IF EXISTS trg_carriers_updated_at ON carriers;`);
  await knex.raw(`DROP TRIGGER IF EXISTS trg_affiliates_updated_at ON affiliates;`);
  await knex.raw(`DROP TRIGGER IF EXISTS trg_users_updated_at ON users;`);
  await knex.raw(`DROP FUNCTION IF EXISTS update_updated_at();`);

  await knex.raw(`DROP TABLE IF EXISTS notifications;`);
  await knex.raw(`DROP TABLE IF EXISTS affiliate_earnings;`);
  await knex.raw(`DROP TABLE IF EXISTS parcel_status_history;`);
  await knex.raw(`DROP TABLE IF EXISTS parcels;`);
  await knex.raw(`DROP TABLE IF EXISTS carriers;`);
  await knex.raw(`DROP TABLE IF EXISTS affiliates;`);
  await knex.raw(`DROP TABLE IF EXISTS users;`);

  await knex.raw(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
};
