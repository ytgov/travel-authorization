import { ModelStatic, Op } from "sequelize"
import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"
import { User, TravelDeskTravelRequest, TravelAuthorization } from "@/models"
import TravelAuthorizationsPolicy from "@/policies/travel-authorizations-policy"
import BasePolicy from "@/policies/base-policy"

export class TravelDeskTravelRequestsPolicy extends BasePolicy<TravelDeskTravelRequest> {
  show(): boolean {
    return this.travelAuthorizationsPolicy.show()
  }

  update(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true
    if (this.travelAuthorization.supervisorEmail === this.user.email) return true
    if (
      this.travelAuthorization.userId === this.user.id &&
      this.travelAuthorization.status === TravelAuthorization.Statuses.APPROVED &&
      this.record.status === TravelDeskTravelRequest.Statuses.DRAFT
    ) {
      return true
    }

    return false
  }

  static applyScope(
    modelClass: ModelStatic<TravelDeskTravelRequest>,
    currentUser: User
  ): ModelStatic<TravelDeskTravelRequest> {
    if (currentUser.roles.includes(User.Roles.ADMIN)) {
      return modelClass
    }

    return modelClass.scope({
      // @ts-expect-error - Bad types in sequelize, all FindOptions are valid.
      include: [
        {
          association: "travelAuthorization",
          where: {
            [Op.or]: [
              {
                supervisorEmail: currentUser.email,
              },
              { userId: currentUser.id },
            ],
          },
        },
      ],
    })
  }

  permittedAttributes(): Path[] {
    return [
      "travelDeskTravelAgentId",
      "legalFirstName",
      "legalLastName",
      "strAddress",
      "city",
      "province",
      "postalCode",
      "legalMiddleName",
      "travelPurpose",
      "busPhone",
      "busEmail",
      "status",
      "birthDate",
      "isInternationalTravel",
      "passportCountry",
      "passportNum",
      "travelLocation",
      "travelNotes",
      "travelContact",
      "travelPhone",
      "travelEmail",
      "additionalInformation",
      "travelDeskOfficer",
    ]
  }

  private get travelAuthorization(): TravelAuthorization {
    const { travelAuthorization } = this.record
    if (isUndefined(travelAuthorization)) {
      throw new Error("Travel Authorization is required")
    }

    return travelAuthorization
  }

  private get travelAuthorizationsPolicy(): TravelAuthorizationsPolicy {
    return new TravelAuthorizationsPolicy(this.user, this.travelAuthorization)
  }
}

export default TravelDeskTravelRequestsPolicy
