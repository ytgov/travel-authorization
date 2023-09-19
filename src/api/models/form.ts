import { groupBy, keyBy } from "lodash"

import db from "../db/db-client"
import BaseModel from "./base-model"
import TravelPurpose from "./travel-purpose"

export interface FormRecord {
  id: number
  formId: string
  userId: number
  firstName?: string
  lastName?: string
  department?: string
  division?: string
  branch?: string
  unit?: string
  email?: string
  mailcode?: string
  daysOffTravelStatus?: string
  dateBackToWork?: Date
  travelDuration?: string
  // DEPRECATED: purpose string column on forms table is replace by purposeId column
  //  and purpose association
  // purpose?: string
  purposeId?: number
  travelAdvance?: string
  eventName?: string
  summary?: string
  benefits?: string
  supervisorEmail?: string
  status?: string
  departureDate?: Date
  stops?: any[]
  expenses?: any[]
  estimates?: any[]
  requestChange?: string
  denialReason?: string
  oneWayTrip?: string
  multiStop?: string
  createdBy?: string
  createdDate?: Date
  deletedBy?: string
  deletedDate?: Date
  deleted?: string

  // Associations
  purpose?: TravelPurpose
}

interface Form extends FormRecord {}

class Form extends BaseModel {
  // OPINION: If this is slow, switch to an ORM like Sequelize,
  // it would be a better use of time than optimising this.
  static async findAll({
    where = {},
    include = [],
  }: {
    where?: {}
    include?: string[]
  }): Promise<Form[]> {
    const forms = await db("forms").where(where)

    if (include.includes("stops")) {
      const formIds = forms.map((form) => form.id)
      const stopsByFormId = await db("stops")
        .whereIn("taid", formIds)
        .then((stops) => groupBy(stops, "taid"))
      forms.forEach((form) => {
        const formId = form.id
        form.stops = stopsByFormId[formId]
      })
    }

    if (include.includes("travelPurpose")) {
      const purposeIds = forms.map((form) => form.purposeId)
      const purposesById = await db("travelPurpose")
        .whereIn("id", purposeIds)
        .then((purposes) => keyBy(purposes, "id"))
      forms.forEach((form) => {
        const purposeId = form.purposeId
        form.purpose = purposesById[purposeId]
      })
    }

    return forms
  }
}

export { Form }
export default Form
