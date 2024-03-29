import { isNil } from "lodash"
import { WhereOptions } from "sequelize"

import BaseController from "./base-controller"

import { Expense, TravelAuthorization } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { ExpensesSerializer } from "@/serializers"
import { ExpensesService } from "@/services"

export class ExpensesController extends BaseController {
  index() {
    const where = this.query.where as WhereOptions<Expense>
    return Expense.findAll({
      where,
      order: ["date", "expenseType"],
    }).then((expenses) => {
      const serializedExpenses = ExpensesSerializer.asTable(expenses)
      return this.response.json({ expenses: serializedExpenses })
    })
  }

  async create() {
    const expense = await this.buildExpense()
    const policy = this.buildPolicy(expense)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create this expense." })
    }

    const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
    return ExpensesService.create(permittedAttributes)
      .then((expense) => {
        return this.response.status(201).json({ expense })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Expense creation failed: ${error}` })
      })
  }

  async update() {
    const expense = await this.loadExpense()
    if (isNil(expense)) return this.response.status(404).json({ message: "Expense not found." })

    const policy = this.buildPolicy(expense)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this expense." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    return ExpensesService.update(this.params.expenseId, permittedAttributes)
      .then((expense) => {
        return this.response.json({ expense })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Expense update failed: ${error}` })
      })
  }

  async destroy() {
    const expense = await this.loadExpense()
    if (isNil(expense)) return this.response.status(404).json({ message: "Expense not found." })

    const policy = this.buildPolicy(expense)
    if (!policy.destroy()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to delete this expense." })
    }

    return ExpensesService.destroy(this.params.expenseId)
      .then(() => {
        return this.response.status(204).end()
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `Expense deletion failed: ${error}` })
      })
  }

  private async buildExpense() {
    const attributes = this.request.body
    const expense = Expense.build(attributes)

    const { travelAuthorizationId } = attributes
    const travelAuthorization = await this.loadTravelAuthorization(travelAuthorizationId)
    if (!isNil(travelAuthorization)) {
      expense.travelAuthorization = travelAuthorization
    }

    return expense
  }

  private loadTravelAuthorization(
    travelAuthorizationId: number
  ): Promise<TravelAuthorization | null> {
    return TravelAuthorization.findByPk(travelAuthorizationId, {
      include: ["travelSegments"],
      order: [["travelSegments", "segmentNumber", "ASC"]],
    })
  }

  private loadExpense(): Promise<Expense | null> {
    return Expense.findByPk(this.params.expenseId, {
      include: [
        {
          association: "travelAuthorization",
          include: ["travelSegments"],
          order: [["travelSegments", "segmentNumber", "ASC"]],
        },
      ],
    })
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }
}

export default ExpensesController
