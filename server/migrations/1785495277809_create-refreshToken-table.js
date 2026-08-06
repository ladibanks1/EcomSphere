/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('refresh_tokens', {
    id: {
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
      type: 'uuid',
    },
    user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'RESTRICT',
      index: true
    },
    token: {
      type: 'varchar(225)',
      notNull: true,
      unique: true,
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },
    revoked: {
      type: 'boolean',
      default: false,
      notNull: true,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('refresh_tokens');
};
