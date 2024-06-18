import knex from "knex"

import { DB_NAME, DB_HOST, DB_PASS, DB_PORT, DB_USER } from "@/config"
import logger from "@/utils/logger"

const db = knex({
  client: "postgres",
  connection: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: "postgres", // default database that should always exist
    port: DB_PORT,
  },
})

async function databaseExists(databaseName: string): Promise<boolean> {
  const result = await db.raw(`SELECT 1 FROM pg_database WHERE datname = ?`, [databaseName])

  return result.rows.length > 0
}

async function createDatabase(): Promise<void> {
  if (await databaseExists(DB_NAME)) return

  logger.info(`Database ${DB_NAME} does not exist: creating...`)
  return db.raw(`CREATE DATABASE ${DB_NAME}`).catch((error) => {
    logger.error(`Failed to create database: ${error}`, { error })
  })
}

export default createDatabase
