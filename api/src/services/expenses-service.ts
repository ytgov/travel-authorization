import { isEmpty, isNil } from "lodash"

import db from "@/db/db-client-legacy"

import { Expense } from "@/models"
import BaseService from "./base-service"

export class ExpensesService extends BaseService {
  static async create(attributes: Partial<Expense>): Promise<Expense> {
    const expense = await db<Expense>("expenses")
      .insert(attributes)
      .returning("*")
      .then((result) => {
        if (isEmpty(result)) throw new Error("Could not create expense")

        return result[0]
      })

    return expense
  }

  // CONSIDER: When the update action is this simple, it might make more sense to make
  // an "active record" style model method, and use that directly instead.
  static async update(
    id: string | number,
    attributes: Partial<Expense>
  ): Promise<Expense> {
    const expense = await db<Expense>("expenses")
      .where("id", id)
      .update(attributes)
      .returning("*")
      .then((updatedRecords) => {
        if (isEmpty(updatedRecords)) throw new Error("Could not update expense")

        return updatedRecords[0]
      })

    return expense
  }

  static destroy(id: string | number): Promise<void> {
    return db<Expense>("expenses")
      .where("id", id)
      .delete().then(rowsDeleted => {
        if (rowsDeleted === 0) throw new Error("Could not delete expense")

        return
      })
  }

  static async bulkCreate(formId: number, expenses: Expense[]): Promise<Expense[]> {
    if (!expenses.every((expense) => expense.taid === formId)) {
      throw new Error("All expenses must belong to the same form.")
    }

    return db("expenses").insert(expenses).returning("*")
  }

  static async bulkReplace(formId: number, expenses: Expense[]): Promise<Expense[]> {
    if (!expenses.every((expense) => expense.taid === formId)) {
      throw new Error("All expenses must belong to the same form.")
    }

    return db.transaction(async (transaction) => {
      await transaction("expenses").where("taid", formId).delete()
      return transaction("expenses").insert(expenses).returning("*")
    })
  }
}

export default ExpensesService