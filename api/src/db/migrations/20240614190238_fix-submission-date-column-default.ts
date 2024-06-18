import { Knex } from "knex"
import moment from "moment"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("preapprovedSubmissions", (table) => {
    table.date("submissionDate").defaultTo(knex.raw("CURRENT_DATE")).alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  const format = "YYYY-MM-DD"
  await knex.schema.alterTable("preapprovedSubmissions", (table) => {
    table.date("submissionDate").defaultTo(moment(new Date()).format(format)).alter()
  })
}
