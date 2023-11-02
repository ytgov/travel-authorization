import Vue from "vue"
import VueRouter from "vue-router"

import NotFound from "../views/NotFound.vue"
import AdminUserForm from "../components/Administration/UserManagement/UserComponent/Form"
import AdminDashboard from "../components/Administration/Administration"
import UserManagement from "../components/Administration/UserManagement/Grid"
import FlightEstimate from "../components/Administration/RatesEstimateManagement/AirEstimate"
import PoolCarCost from "../components/Administration/RatesEstimateManagement/PoolCarCost"
import RentalCarEstimates from "../components/Administration/RatesEstimateManagement/RentalCarEstimate"
import YGRates from "../components/Administration/RatesEstimateManagement/YGRates"
import TravelAgents from "../components/Administration/LookupTableManagement/TravelAgents"

import preapprovedRouter from "../modules/preapproved/router"
import travelDeskRouter from "../modules/travelDesk/router"
import travelFormRouter from "../modules/travel-form/router"
import flightExpenseRouter from "../modules/flightExpenses/router"
import reportsRouter from "../modules/reports/router"

import authenticationRouter from "../modules/authentication/router"
import homeRouter from "../modules/home/router"

import store from "../store"

// import { authGuard } from "../auth/authGuard";

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    component: () => import("@/views/Default.vue"),
  },
  ...homeRouter,

  ...authenticationRouter,
  ...preapprovedRouter,
  ...travelDeskRouter,
  ...travelFormRouter,
  ...flightExpenseRouter,
  ...reportsRouter,

  {
    path: "/admin/users/view/:id",
    name: "AdminUserView",
    component: AdminUserForm,
  },
  {
    path: "/administration/users/edit/:id",
    name: "AdminUserEdit",
    component: AdminUserForm,
  },
  {
    path: "/administration",
    name: "AdminDashboard",
    component: AdminDashboard,
  },
  {
    path: "/administration/users",
    name: "User Management",
    component: UserManagement,
  },
  {
    path: "/administration/flightEstimate",
    name: "FlightEstimate",
    component: FlightEstimate,
  },
  {
    path: "/administration/poolCarCost",
    name: "PoolCarCost",
    component: PoolCarCost,
  },
  {
    path: "/administration/rentalCarEstimates",
    name: "RentalCarEstimates",
    component: RentalCarEstimates,
  },
  {
    path: "/administration/ygRates",
    name: "YGRates",
    component: YGRates,
  },
  {
    path: "/administration/TravelAgents",
    name: "TravelAgents",
    meta: {
      requiresAuth: true,
    },
    component: TravelAgents,
  },
  {
    path: "/qa/scenarios",
    name: "Qa-Scenarios",
    component: () => import("@/views/qa/ScenariosList"),
  },
  {
    path: "/health-check",
    name: "HealthCheck",
    component: () => import("@/components/HealthCheck"),
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound,
  },
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

import { getInstance } from "@/auth"
let authService

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false

  if (!requiresAuth) {
    return next()
  }

  if (!authService) {
    authService = await getInstance()
  }

  const guardAction = () => {
    if (authService.isAuthenticated) {
      return next()
    }

    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } })
  }

  // If the Auth0Plugin has loaded already, check the authentication state
  if (!authService.isLoading) {
    return guardAction()
  }

  authService.$watch("isLoading", (isLoading) => {
    if (isLoading === false) {
      return guardAction()
    }
  })
})

router.afterEach(async () => {
  return await store.dispatch("auth/checkAuthentication")
})

export default router
