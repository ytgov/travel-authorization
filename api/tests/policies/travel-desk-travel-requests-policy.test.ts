import { TravelAuthorization, TravelDeskTravelRequest, User } from "@/models"
import { TravelDeskTravelRequestsPolicy } from "@/policies"
import {
  travelAuthorizationFactory,
  travelDeskTravelRequestFactory,
  userFactory,
} from "@/factories"

describe("api/src/policies/travel-desk-travel-requests-policy.ts", () => {
  describe("TravelDeskTravelRequestsPolicy", () => {
    describe("#update", () => {
      test("when user role is user, and travel authorizations belongs to user, and travel authorization status is approved, and travel desk travel request status is draft, returns true", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          supervisorEmail: "some-other-users-email@test.com",
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.DRAFT,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization

        // Act
        const policy = new TravelDeskTravelRequestsPolicy(user, travelDeskTravelRequest)

        // Assert
        expect(policy.update()).toBe(true)
      })

      test("when user role is user, and travel authorization belongs to user, and travel authorization status is approved, and travel desk travel request status is submitted, returns false", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.USER],
        })
        const travelAuthorization = await travelAuthorizationFactory.create({
          userId: user.id,
          supervisorEmail: "some-other-users-email@test.com",
          status: TravelAuthorization.Statuses.APPROVED,
        })
        const travelDeskTravelRequest = await travelDeskTravelRequestFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          status: TravelDeskTravelRequest.Statuses.SUBMITTED,
        })
        travelDeskTravelRequest.travelAuthorization = travelAuthorization

        // Act
        const policy = new TravelDeskTravelRequestsPolicy(user, travelDeskTravelRequest)

        // Assert
        expect(policy.update()).toBe(false)
      })
    })
  })
})
