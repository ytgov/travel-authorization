import { groupBy, isEmpty, isNil, keyBy } from "lodash"

import db from "../db/db-client"
import BaseModel from "./base-model"
import TravelPurpose from "./travel-purpose"

// These are a best guess, database values may not match this list.
// TODO: normalize database values and make sure all statuses are in this list.
// If we want validation for this field we should swith to an ORM such as Sequelize.
export enum FormStatuses {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  APPROVED = "Approved",
  DENIED = "Denied",
  CHANGE_REQUESTED = "Change Requested",
}

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
  // DEPRECATED: travelAdvance column on forms table is replaced by travelAdvanceInCents column
  // travelAdvance?: number
  travelAdvanceInCents?: number
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
    limit = 10,
    offset = 0,
  }: {
    where?: {}
    include?: ("stops" | "purpose")[]
    limit?: number
    offset?: number
  }): Promise<Form[]> {
    const forms = await db("forms").where(where).limit(limit).offset(offset)

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

    if (include.includes("purpose")) {
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

  // OPINION: If this is slow, switch to an ORM like Sequelize,
  // it would be a better use of time than optimising this.
  static async findByPk(
    id: number | string,
    { include = [] }: { include?: ("stops" | "purpose")[] }
  ): Promise<Form> {
    const form = await db("forms").where({ id }).first()
    if (isNil(form)) throw new Error("Form not found")

    if (include.includes("stops")) {
      const formId = form.id
      const stops = await db("stops").where({ taid: formId })
      form.stops = stops
    }

    if (include.includes("purpose")) {
      const purposeId = form.purposeId
      const purpose = await db("travelPurpose").where({ id: purposeId })
      form.purpose = purpose
    }

    return form
  }
}

export { Form }
export default Form