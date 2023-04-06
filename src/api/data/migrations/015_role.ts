import * as knex from "knex";

exports.up = function (knex: knex.Knex, Promise: any) {
  return knex.schema.createTable("role", function (t) {
    t.increments("id").notNullable().primary();
    t.string("name").notNullable();
  });
};

exports.down = function (knex: knex.Knex, Promise: any) {
  return knex.schema.dropTable("role");
};
