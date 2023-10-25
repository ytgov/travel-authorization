import BaseController from "@/controllers/base-controller"

import { Expense, TravelAuthorization } from "@/models"
import { ExpensesPolicy } from "@/policies"
import { BulkGenerate } from "@/services/estimates"

export class GenerateController extends BaseController {
  async create() {
    const expense = await this.buildExpense()
    const policy = this.buildPolicy(expense)
    if (!policy.create()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to create this expense." })
    }

    return BulkGenerate.perform(this.travelAuthorizationId)
      .then((estimates) => {
        return this.response.status(201).json({
          estimates,
          message: "Generated estimates",
        })
      })
      .catch((error) => {
        return this.response.status(422).json({
          message: `Failed to generate estimate: ${error}`,
        })
      })
  }

  private async buildExpense() {
    const expense = Expense.build()
    expense.travelAuthorization = (await TravelAuthorization.findByPk(this.travelAuthorizationId)) || undefined
    return expense
  }

  private buildPolicy(record: Expense): ExpensesPolicy {
    return new ExpensesPolicy(this.currentUser, record)
  }

  private get travelAuthorizationId() {
    return parseInt(this.params.travelAuthorizationId.toString())
  }
}

export default GenerateController