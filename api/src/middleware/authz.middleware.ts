import { NextFunction, Response } from "express"
import { expressjwt as jwt, type Request } from "express-jwt"
import axios from "axios"
import jwksRsa, { type GetVerificationKey } from "jwks-rsa"

import { AUTH0_DOMAIN, AUTH0_AUDIENCE } from "@/config"
import { User } from "@/models"
import { isNil } from "lodash"

console.log("AUTH0_DOMAIN", `${AUTH0_DOMAIN}/.well-known/jwks.json`)

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,

  // Validate the audience and the issuer.
  audience: AUTH0_AUDIENCE,
  issuer: [`${AUTH0_DOMAIN}/`],
  algorithms: ["RS256"],
})

interface Auth0Response {
  sub: string // "auth0|6241ec44e5b4a700693df293"
  given_name: string // "Jane"
  family_name: string // "Doe"
  nickname: string // "Jane"
  name: string // "Jane Doe"
  picture: string // https://s.gravatar.com/avatar/1234567890abcdef1234567890abcdef?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fmb.png
  updated_at: string // "2023-10-30T17:25:52.975Z"
  email: string // "janedoe@gmail.com"
  email_verified: boolean // true
}

class Auth0PayloadError extends Error {
  constructor(data: any) {
    super(`Payload from Auth0 is strange or failed for: ${JSON.stringify(data)}`)
    this.name = "Auth0PayloadError"
  }
}

function findOrCreateUserFromAuth0Token(token: string): Promise<User> {
  return axios
    .get(`${AUTH0_DOMAIN}/userinfo`, {
      headers: {
        authorization: token,
      },
    })
    .then(async ({ data }: { data: Auth0Response }) => {
      const sub = data.sub
      if (isNil(sub)) {
        throw new Auth0PayloadError(data)
      }

      const { email, given_name: firstName, family_name: lastName } = data

      const fallbackEmail = `${firstName}.${lastName}@yukon-no-email.ca`
      const [user, created] = await User.findOrCreate({
        where: { sub },
        defaults: {
          sub,
          email: email || fallbackEmail,
          firstName,
          lastName,
          roles: [User.Roles.USER],
          status: User.Statuses.ACTIVE,
        },
      })

      if (created) {
        console.log(`CREATED USER FOR ${email}: ${JSON.stringify(user.dataValues)}`)
      }

      return user
    })
}

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  const sub = req.auth?.sub // from express-jwt

  const user = await User.findOne({ where: { sub } })
  if (user !== null) {
    req.user = user
    return next()
  }

  const token = req.headers.authorization || ""
  return findOrCreateUserFromAuth0Token(token)
    .then((user) => {
      req.user = user
      return next()
    })
    .catch((error) => {
      if (error instanceof Auth0PayloadError) {
        console.log(error)
        return res.status(502).json({ message: "External authorization api failed." })
      } else {
        return res.status(401).json({ message: "User authentication failed." })
      }
    })
}
