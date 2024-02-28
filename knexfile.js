const { postgresConfig } = require('./.env')

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'postgresql',
  connection: {
    database: postgresConfig.database,
    host: postgresConfig.host,
    port: postgresConfig.port,
    user: postgresConfig.user,
    password: postgresConfig.password
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};