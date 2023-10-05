import db from "../db/db-client"

import BaseModel from "./base-model"
import Form from "./form"

export enum ExpenseTypes {
  ACCOMODATIONS = "Accomodations",
  FLIGHTS = "Flights",
  MEALS_INCIDENTALS = "Meals & Incidentals",
}

// TODO: replace this with a boolean of isEstimate or
// move estimates to there own table.
// It's also possible that this is a single table inheritance model,
// and there should be two models, one for each "type".
export enum Types {
  ESTIMATE = "Estimates",
  EXPENSE = "Expenses",
}

export class Expense extends BaseModel {
  id: number
  taid: number
  description: string
  date: Date | null
  cost: number
  currency: string
  type: Types
  receiptImage: Buffer | null
  fileSize: number | null
  fileName: string | null
  expenseType: ExpenseTypes

  // Assocaitions
  form?: Form

  constructor(
    attributes: Pick<
      Expense,
      "id" | "taid" | "description" | "cost" | "currency" | "type" | "expenseType"
    > &
      Partial<Expense>
  ) {
    super()
    this.id = attributes.id
    this.taid = attributes.taid
    this.description = attributes.description
    this.date = attributes.date || null
    this.cost = attributes.cost
    this.currency = attributes.currency
    this.type = attributes.type
    this.receiptImage = attributes.receiptImage || null
    this.fileSize = attributes.fileSize || null
    this.fileName = attributes.fileName || null
    this.expenseType = attributes.expenseType

    this.form = attributes.form
  }

  static async findAll({
    where = {},
    include = [],
    limit = 1000,
    offset = 0,
  }: {
    where?: {}
    include?: string[]
    limit?: number
    offset?: number
  } = {}): Promise<Expense[]> {
    const expenses = await db("expenses").where(where).limit(limit).offset(offset)
    return expenses
  }
}

export default Expense
