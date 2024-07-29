import { Path } from "@/utils/deep-pick"
import { User } from "@/models"
import BasePolicy from "@/policies/base-policy"

export class UsersPolicy extends BasePolicy<User> {
  show(): boolean {
    return true
  }

  create(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true

    return false
  }

  update(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true
    if (this.record.id === this.user.id) return true

    return false
  }

  destroy(): boolean {
    if (this.user.roles.includes(User.Roles.ADMIN)) return true

    return false
  }

  permittedAttributes(): Path[] {
    if (!this.user.roles.includes(User.Roles.ADMIN)) {
      return ["firstName", "lastName"]
    }

    return [
      "firstName",
      "lastName",
      "department",
      "division",
      "branch",
      "unit",
      "mailcode",
      "manager",
      "roles",
      "status",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["email", ...this.permittedAttributes()]
  }
}

export default UsersPolicy
