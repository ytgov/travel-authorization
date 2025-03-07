import axios from "axios"
import qs from "qs"

import { auth0 } from "@/plugins/auth0-plugin"
import { API_BASE_URL } from "@/config"

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, {
        arrayFormat: "indices",
        strictNullHandling: true,
      })
    },
  },
})

httpClient.interceptors.request.use(async (config) => {
  const accessToken = await auth0.getTokenSilently()
  config.headers["Authorization"] = `Bearer ${accessToken}`
  return config
})

// Any status codes that falls outside the range of 2xx causes this function to trigger
httpClient.interceptors.response.use(null, async (error) => {
  // Auth0 error type is unknown but it sets the error.error property to "login_required"
  // Bounce the user if they hit a login required error when trying to access a protected route
  // It would probably be better to move this code to a route guard or something?
  if (error?.error === "login_required") {
    throw new Error("You must be logged in to access this endpoint")
  } else if (error?.response?.data?.message) {
    throw new Error(error.response.data.message)
  } else if (error.message) {
    throw new Error(error.message)
  } else {
    throw new Error("An unknown error occurred")
  }
})

export default httpClient
