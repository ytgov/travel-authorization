import Vue from "vue"
import VueRouter from "vue-router"

import { authGuard } from "@/utils/auth-guard"
import useRouteHistory from "@/use/use-route-history"

import travelDeskRouter from "@/modules/travelDesk/router"
import travelAuthorizationsRouter from "@/modules/travel-authorizations/router"
import reportsRouter from "@/modules/reports/router"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        redirect: "dashboard",
      },
      {
        name: "DashboardPage",
        path: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
      },
      {
        // TODO: push readcrumbs into higher layout
        component: () => import("@/layouts/LayoutWithBreadcrumbs.vue"),
        path: "",
        children: [
          {
            path: "profile",
            name: "ProfilePage",
            component: () => import("@/pages/ProfilePage.vue"),
          },
          {
            path: "users/:userId",
            name: "users/UserPage",
            component: () => import("@/pages/users/UserPage.vue"),
            props: true,
          },

          // Start of Main Content Pages
          {
            path: "my-travel-requests",
            name: "my-travel-requests/MyTravelRequestsPage",
            component: () => import("@/pages/my-travel-requests/MyTravelRequestsPage.vue"),
          },
          {
            path: "my-travel-requests/:travelAuthorizationId/wizard/:stepName",
            name: "my-travel-requests/MyTravelRequestWizardPage",
            component: () => import("@/pages/my-travel-requests/MyTravelRequestWizardPage.vue"),
            props: true,
          },
          {
            name: "ManageTravelRequests",
            path: "manage-travel-requests",
            component: () => import("@/pages/ManageTravelRequestsPage.vue"),
          },
          {
            path: "travel-pre-approvals",
            component: () => import("@/pages/TravelPreApprovalsPage.vue"),
            children: [
              {
                path: "",
                redirect: "requests",
              },
              {
                path: "requests",
                name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
                component: () =>
                  import("@/pages/travel-pre-approvals/TravelPreApprovalRequestsPage.vue"),
              },
              {
                path: "submissions",
                name: "travel-pre-approvals/TravelPreApprovalSubmissionsPage",
                component: () =>
                  import("@/pages/travel-pre-approvals/TravelPreApprovalSubmissionsPage.vue"),
              },
            ],
          },
          {
            path: "travel-pre-approvals/new",
            name: "travel-pre-approvals/TravelPreApprovalNewPage",
            component: () => import("@/pages/travel-pre-approvals/TravelPreApprovalNewPage.vue"),
          },
          {
            path: "travel-pre-approvals/:travelAuthorizationPreApprovalId",
            name: "travel-pre-approvals/TravelPreApprovalPage",
            component: () => import("@/pages/travel-pre-approvals/TravelPreApprovalPage.vue"),
            props: true,
          },
          {
            path: "travel-pre-approvals/:travelAuthorizationPreApprovalId/edit",
            name: "travel-pre-approvals/TravelPreApprovalEditPage",
            component: () => import("@/pages/travel-pre-approvals/TravelPreApprovalEditPage.vue"),
            props: true,
          },
          {
            path: "travel-pre-approval-submissions/:travelAuthorizationPreApprovalSubmissionId",
            name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionPage",
            component: () =>
              import("@/pages/travel-pre-approval-submissions/TravelPreApprovalSubmissionPage.vue"),
            props: true,
          },
          {
            path: "travel-pre-approval-submissions/:travelAuthorizationPreApprovalSubmissionId/edit",
            name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage",
            component: () =>
              import(
                "@/pages/travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage.vue"
              ),
            props: true,
          },
          {
            name: "TravelDeskPage",
            path: "travel-desk",
            component: () => import("@/pages/TravelDeskPage.vue"),
          },
          {
            name: "TravelDeskReadPage",
            path: "travel-desk/:travelDeskTravelRequestId",
            component: () => import("@/pages/travel-desk/TravelDeskReadPage.vue"),
            props: true,
          },
          {
            name: "TravelDeskEditPage",
            path: "travel-desk/:travelDeskTravelRequestId/edit",
            component: () => import("@/pages/travel-desk/TravelDeskEditPage.vue"),
            props: true,
          },
          {
            name: "TravelDeskFlightSegmentsManagePage",
            path: "travel-desk/:travelDeskTravelRequestId/manage-flight-segments",
            component: () => import("@/pages/travel-desk/TravelDeskFlightSegmentsManagePage.vue"),
            props: true,
          },
          {
            path: "/flight-expenses",
            component: () => import("@/layouts/FlightExpensesLayout.vue"),
            children: [
              {
                path: "",
                redirect: "all",
              },
              {
                path: "all",
                name: "flight-expenses/AllFlightExpensesPage",
                component: () => import("@/pages/flight-expenses/AllFlightExpensesPage.vue"),
              },
              {
                path: "reconciled",
                name: "flight-expenses/ReconciledFlightExpensesPage",
                component: () => import("@/pages/flight-expenses/ReconciledFlightExpensesPage.vue"),
              },
              {
                path: "unreconciled",
                name: "flight-expenses/UnreconciledFlightExpensesPage",
                component: () =>
                  import("@/pages/flight-expenses/UnreconciledFlightExpensesPage.vue"),
              },
            ],
          },
          // End of Main Content Pages
          // Start of Administration pages
          {
            path: "administration",
            name: "AdministrationPage",
            component: () => import("@/pages/AdministrationPage.vue"),
          },
          {
            path: "administration/users/:userId/edit",
            name: "administration/users/UserEditPage",
            component: () => import("@/pages/administration/users/UserEditPage.vue"),
            props: true,
          },
          {
            path: "administration/users",
            name: "administration/UsersPage",
            component: () => import("@/pages/administration/UsersPage.vue"),
          },
          {
            path: "administration/flight-estimates",
            name: "administration/FlightEstimatesPage",
            component: () => import("@/pages/administration/FlightEstimatesPage.vue"),
          },
          {
            path: "administration/pool-car-costs",
            name: "administration/PoolCarCostsPage",
            component: () => import("@/pages/administration/PoolCarCostsPage.vue"),
          },
          {
            path: "administration/travel-purposes",
            name: "administration/TravelPurposesPage",
            component: () => import("@/pages/administration/TravelPurposesPage.vue"),
          },
          {
            path: "administration/rental-car-estimates",
            name: "administration/RentalCarEstimatesPage",
            component: () => import("@/pages/administration/RentalCarEstimatesPage.vue"),
          },
          {
            path: "administration/travel-rates",
            name: "administration/TravelRatesPage",
            component: () => import("@/pages/administration/TravelRatesPage.vue"),
          },
          {
            path: "administration/travel-rates/edit",
            name: "administration/TravelRatesEditPage",
            component: () => import("@/pages/administration/TravelRatesEditPage.vue"),
          },
          {
            path: "administration/travel-agencies",
            name: "administration/TravelAgenciesPage",
            component: () => import("@/pages/administration/TravelAgenciesPage.vue"),
          },
          {
            path: "administration/travel-agencies/new",
            name: "administration/travel-agencies/TravelAgencyNewPage",
            component: () =>
              import("@/pages/administration/travel-agencies/TravelAgencyNewPage.vue"),
          },
          {
            path: "administration/travel-agencies/:travelDeskTravelAgencyId/edit",
            name: "administration/travel-agencies/TravelAgencyEditPage",
            component: () =>
              import("@/pages/administration/travel-agencies/TravelAgencyEditPage.vue"),
            props: true,
          },
          // End of Administration pages
        ],
      },
      {
        path: "qa/scenarios",
        name: "Qa-Scenarios",
        component: () => import("@/pages/qa/ScenariosListPage.vue"),
      },
      {
        path: "health-check",
        name: "HealthCheck",
        component: () => import("@/pages/HealthCheckPage.vue"),
        meta: { requiresAuth: false },
      },
    ],
  },

  ...travelDeskRouter,
  ...travelAuthorizationsRouter,
  ...reportsRouter,

  {
    name: "SignInPage",
    path: "/sign-in",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    name: "UnauthorizedPage",
    path: "/errors/unauthorized",
    component: () => import("@/pages/UnauthorizedPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "*",
    name: "Not Found",
    component: () => import("@/pages/NotFoundPage.vue"),
    meta: { requiresAuth: false },
  },
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

const { add } = useRouteHistory()

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth === false) {
    add(from)
    return next()
  }

  const isAuthenticated = await authGuard(to)
  if (isAuthenticated) {
    add(from)
    return next()
  }

  return next(false)
})

export default router
