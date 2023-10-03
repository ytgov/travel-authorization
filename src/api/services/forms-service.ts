import { isNil, isEmpty } from "lodash"
import { v4 as uuid } from "uuid"

import db from "../db/db-client"

import { Form, User } from "../models"
import StopsService from "./stops-service"
import LegacyFormSerivce from "./form-service"

export class FormsSerivce {
  static async create(attributes: Form, currentUser: User): Promise<Form> {
    const stops = attributes.stops || []
    delete attributes.stops

    const expenses = attributes.expenses
    delete attributes.expenses

    const estimates = attributes.estimates
    delete attributes.estimates

    attributes.userId = currentUser.id

    // Not sure if this is correct, but I can't find any that generates the formId.
    if (isNil(attributes.formId)) {
      attributes.formId = uuid()
    }

    const form = await db<Form>("forms")
      .insert(attributes)
      .returning("*")
      .then((result) => {
        if (isEmpty(result)) throw new Error("Could not create form")

        return result[0]
      })

    // OPINION: It's not worth supporting layered transactions here,
    // though that would be the standard way of doing things.
    // If we are using an ORM such as Sequelize, it would then be worth doing.
    const formId = form.id
    if (!isEmpty(stops)) {
      stops.forEach(async (stop) => {
        stop.taid = formId
      })
      await StopsService.bulkCreate(formId, stops)
    }

    const instance = new LegacyFormSerivce()
    await instance.saveExpenses(formId, expenses)
    await instance.saveEstimates(formId, estimates)

    return form
  }

  static async update(id: string | number, attributes: Partial<Form>): Promise<Form> {
    const stops = attributes.stops || []
    delete attributes.stops

    const expenses = attributes.expenses
    delete attributes.expenses

    const estimates = attributes.estimates
    delete attributes.estimates

    const form = await db<Form>("forms")
      .where("id", id)
      .update(attributes)
      .returning("*")
      .then((updatedRecords) => {
        if (isEmpty(updatedRecords)) throw new Error("Could not update form")

        return updatedRecords[0]
      })

    // OPINION: It's not worth supporting layered transactions here,
    // though that would be the standard way of doing things.
    // If we are using an ORM such as Sequelize, it would then be worth doing.
    const formId = form.id
    if (!isEmpty(stops)) {
      await StopsService.bulkReplace(formId, stops)
    }

    const instance = new LegacyFormSerivce()
    await instance.saveExpenses(formId, expenses)
    await instance.saveEstimates(formId, estimates)

    return form
  }
}

export default FormsSerivce