import { cast } from "@/utils/vue-router-utils"

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "MyTravelAuthorizationsPage",
        path: "my-travel-requests",
        component: () => import("@/modules/travel-authorizations/pages/MyTravelAuthorizationsPage"),
      },

      {
        name: "ManageTravelAuthorizationsPage",
        path: "manager-view",
        component: () =>
          import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationsPage"),
      },
    ],
  },
  {
    path: "/my-travel-requests",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        path: ":formId",
        component: () =>
          import("@/modules/travel-authorizations/layouts/ReadMyTravelAuthorizationLayout"),
        props: cast("formId", parseInt),
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            path: "details",
            name: "ReadMyTravelAuthorizationDetailsPage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ReadMyTravelAuthorizationDetailsPage"),
            props: true,
          },
          {
            path: "estimate",
            name: "ReadMyTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ReadMyTravelAuthorizationEstimatePage"),
            props: true,
          },
        ],
      },
      {
        path: ":travelAuthorizationId/edit",
        component: () =>
          import("@/modules/travel-authorizations/layouts/EditMyTravelAuthorizationLayout"),
        props: cast("travelAuthorizationId", parseInt),
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            path: "details",
            name: "EditMyTravelAuthorizationDetailsPage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditMyTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "estimate",
            name: "EditMyTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditMyTravelAuthorizationEstimatePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
    ],
  },
  {
    path: "/travel-requests",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        path: ":travelAuthorizationId/manage",
        component: () =>
          import("@/modules/travel-authorizations/layouts/ManageTravelAuthorizationLayout"),
        props: cast("travelAuthorizationId", parseInt),
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            name: "ManageTravelAuthorizationDetailsPage",
            path: "details",
            component: () =>
              import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
    ],
  },
]

export default routes
