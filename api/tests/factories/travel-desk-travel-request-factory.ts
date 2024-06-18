import { DeepPartial, Factory } from "fishery"
import { faker } from "@faker-js/faker"

import { TravelDeskTravelRequest } from "@/models"

export const travelDeskTravelRequestFactory = Factory.define<TravelDeskTravelRequest>(
  ({ sequence, onCreate, params }) => {
    onCreate((travelDeskTravelRequest) => travelDeskTravelRequest.save())

    assertParamsHasTravelAuthorizationId(params)

    return TravelDeskTravelRequest.build({
      id: sequence,
      travelAuthorizationId: params.travelAuthorizationId,
      legalFirstName: faker.person.firstName(),
      legalLastName: faker.person.lastName(),
      strAddress: faker.location.streetAddress(),
      city: faker.location.city(),
      province: faker.location.state(),
      postalCode: faker.location.zipCode(),
      travelPurpose: faker.lorem.sentence(),
      busPhone: faker.phone.number(),
      busEmail: faker.internet.email(),
      status: faker.helpers.enumValue(TravelDeskTravelRequest.Statuses),
    })
  }
)

function assertParamsHasTravelAuthorizationId(
  params: DeepPartial<TravelDeskTravelRequest>
): asserts params is DeepPartial<TravelDeskTravelRequest> & { travelAuthorizationId: number } {
  if (typeof params.travelAuthorizationId !== "number") {
    throw new Error("travelAuthorizationId is must be a number")
  }
}

export default travelDeskTravelRequestFactory
