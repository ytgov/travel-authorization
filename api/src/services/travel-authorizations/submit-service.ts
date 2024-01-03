import { isNil } from "lodash"

import db from "@/db/db-client"

import BaseService from "@/services/base-service"
import { UpdateService } from "@/services/travel-authorizations"
import { EnsureService } from "@/services/users"

import { TravelAuthorization, TravelAuthorizationActionLog, User } from "@/models"

export class SubmitService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private attributes: Partial<TravelAuthorization>
  private currentUser: User

  constructor(
    travelAuthorization: TravelAuthorization,
    attributes: Partial<TravelAuthorization>,
    currentUser: User
  ) {
    super()
    this.travelAuthorization = travelAuthorization
    this.attributes = attributes
    this.currentUser = currentUser
  }

  async perform(): Promise<TravelAuthorization> {
    if (this.travelAuthorization.status !== TravelAuthorization.Statuses.DRAFT) {
      throw new Error("Travel authorization must be in draft state to submit.")
    }

    const supervisorEmail = this.travelAuthorization.supervisorEmail
    if (isNil(supervisorEmail)) {
      throw new Error("Supervisor email is required for travel authorization submission.")
    }

    await db.transaction(async () => {
      this.travelAuthorization = await UpdateService.perform(
        this.travelAuthorization,
        {
          ...this.attributes,
          status: TravelAuthorization.Statuses.SUBMITTED,
        },
        this.currentUser
      )

      const supervisor = await EnsureService.perform(
        {
          email: supervisorEmail,
        },
        this.currentUser
      ).catch((error) => {
        throw new Error(`Failed to ensure supervisor: ${error}`)
      })

      await TravelAuthorizationActionLog.create({
        travelAuthorizationId: this.travelAuthorization.id,
        actorId: this.currentUser.id,
        assigneeId: supervisor.id,
        action: TravelAuthorizationActionLog.Actions.SUBMITTED,
      })
    })

    return this.travelAuthorization
  }
}

export default SubmitService
