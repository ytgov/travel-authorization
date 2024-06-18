import knex from "@/db/db-client-legacy"
import logger from "@/utils/logger"

async function runMigrations(): Promise<void> {
  const [_completedMigrations, pendingMigrations]: [string[], string[]] = await knex.migrate.list()

  if (pendingMigrations.length === 0) {
    logger.info("No pending migrations.")
    return
  }

  return pendingMigrations
    .reduce(async (previousMigration, migration) => {
      await previousMigration

      logger.info(`Running migration: ${migration}`)
      return knex.migrate.up()
    }, Promise.resolve())
    .then(() => {
      logger.info("All migrations completed successfully.")
    })
    .catch((error) => {
      logger.error(`Error running migrations: ${error}`, { error })
      throw error
    })
}

export default runMigrations
