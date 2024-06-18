import { isEmpty, isNil } from "lodash"

import logger from "@/utils/logger"
import { User } from "@/models"
import { yukonGovernmentIntegration } from "@/integrations"

import BaseService from "@/services/base-service"

export class YkGovernmentDirectorySyncService extends BaseService {
  private user: User

  constructor(user: User) {
    super()
    this.user = user
  }

  async perform(): Promise<User> {
    const email = this.user.email

    try {
      const employee = await yukonGovernmentIntegration.fetchEmployee(email)
      if (isNil(employee)) {
        logger.info(`Failed to find any employee info for email=${email}`)
        return this.user.update({
          lastSyncFailureAt: new Date(),
        })
      }

      return this.user.update({
        department: employee.department,
        division: employee.division,
        branch: employee.branch,
        unit: employee.unit,
        mailcode: employee.mailcode,
        manager: employee.manager,
        lastSyncSuccessAt: new Date(),
        lastSyncFailureAt: null,
      })
    } catch (error) {
      logger.error(`User sync failure for ${email} with yukon government directory: ${error}`, {
        error,
      })
      return this.user.update({
        lastSyncFailureAt: new Date(),
      })
    }
  }
}

export default YkGovernmentDirectorySyncService
