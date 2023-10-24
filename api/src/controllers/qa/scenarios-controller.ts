import BaseController from "@/controllers/base-controller"

// This is really a model ... but it's so small I put it here
export enum ScenarioTypes {
  MY_TRAVEL_REQUESTS = "my-travel-requests",
}

export class ScenariosController extends BaseController {
  index() {
    return this.response.status(200).json({
      scenarios: Object.values(ScenarioTypes),
    })
  }
}

export default ScenariosController
