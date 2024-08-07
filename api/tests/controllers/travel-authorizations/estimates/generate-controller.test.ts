import request from "supertest"

import app from "@/app"
import { BulkGenerateService } from "@/services/estimates"
import { TravelAuthorization, User } from "@/models"
import { travelAuthorizationFactory, userFactory } from "@/factories"

import { mockCurrentUser } from "@/support/mock-current-user"

jest.mock("@/services/estimates", () => ({ BulkGenerateService: { perform: jest.fn() } }))

const mockedBulkGenerateServicePerform = BulkGenerateService.perform as unknown as jest.Mock

describe("api/src/controllers/travel-authorizations/estimates/generate-controller.ts", () => {
  let user: User

  beforeEach(async () => {
    user = await userFactory.create({
      roles: [User.Roles.USER],
    })
    mockCurrentUser(user)
  })

  describe("POST /api/travel-authorizations/:travelAuthorizationId/estimates/generate", () => {
    test("when authorized and bulk generation is successful", async () => {
      const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
        status: TravelAuthorization.Statuses.DRAFT,
      })

      const mockBulkGenerateServicePerformResponse = "mock bulk generate response"
      mockedBulkGenerateServicePerform.mockImplementation(() => {
        return Promise.resolve(mockBulkGenerateServicePerformResponse)
      })

      return request(app)
        .post(`/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`)
        .expect("Content-Type", /json/)
        .expect(201, {
          estimates: mockBulkGenerateServicePerformResponse,
          message: "Generated estimates",
        })
    })

    test("when authorized and bulk generation not is successful", async () => {
      const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
        status: TravelAuthorization.Statuses.DRAFT,
      })

      const mockBulkGenerateServicePerformResponse = "mock bulk generate response"
      mockedBulkGenerateServicePerform.mockImplementation(() => {
        return Promise.reject(mockBulkGenerateServicePerformResponse)
      })

      return request(app)
        .post(`/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`)
        .expect("Content-Type", /json/)
        .expect(422, {
          message: `Failed to generate estimate: ${mockBulkGenerateServicePerformResponse}`,
        })
    })

    test("when not authorized", async () => {
      const travelAuthorization = await travelAuthorizationFactory.associations({ user }).create({
        status: TravelAuthorization.Statuses.SUBMITTED,
      })

      return request(app)
        .post(`/api/travel-authorizations/${travelAuthorization.id}/estimates/generate`)
        .expect("Content-Type", /json/)
        .expect(403, { message: "You are not authorized to create this expense." })
    })

    test("when travel authorization does not exist", async () => {
      const invalidTravelAuthorizationId = -1
      return request(app)
        .post(`/api/travel-authorizations/${invalidTravelAuthorizationId}/estimates/generate`)
        .expect("Content-Type", /json/)
        .expect(404, { message: "Travel authorization not found." })
    })
  })
})
