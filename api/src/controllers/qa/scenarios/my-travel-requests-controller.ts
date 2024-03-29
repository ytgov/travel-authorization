import BaseController from "@/controllers/base-controller"

import { MyTravelRequestsService } from "@/services/qa/scenarios"

export class MyTravelRequestsController extends BaseController {
  async create() {
    return MyTravelRequestsService.perform(this.currentUser)
      .then(() => {
        return this.response.status(201).json({ message: "My Travel Request Scenario Applied" })
      })
      .catch((error) => {
        return this.response.status(422).json({ message: `My Travel Request Scenario enactment failed: ${error}` })
      })
  }
}

export default MyTravelRequestsController
