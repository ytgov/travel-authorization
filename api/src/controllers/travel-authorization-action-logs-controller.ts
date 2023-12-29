import { WhereOptions } from "sequelize"

import { TravelAuthorizationActionLog } from "@/models"

import BaseController from "@/controllers/base-controller"

export class TravelAuthorizationActionLogsController extends BaseController {
  async index() {
    const where = this.query.where as WhereOptions<TravelAuthorizationActionLog>
    // TODO: add policy scoping to query

    return TravelAuthorizationActionLog.findAll({
      where,
      order: [["createdAt", "ASC"]],
    }).then((travelAuthorizationActionLogs) => {
      return this.response.json({ travelAuthorizationActionLogs })
    })
  }
}

export default TravelAuthorizationActionLogsController
