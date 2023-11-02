const routes = [
  {
    path: "/my-travel-requests",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "TravelFormList",
        path: "",
        meta: {
          requiresAuth: true,
        },
        component: () => import("@/modules/travel-form/pages/TravelFormList"),
      },
      {
        path: ":formId",
        component: () => import("@/modules/travel-form/pages/TravelAuthorizationRead"),
        props: true,
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            path: "details",
            name: "TravelAuthorizationRead-DetailsTab",
            component: () => import("@/modules/travel-form/pages/travel-authorization-read/DetailsTab"),
            props: true,
          },
          // TODO: add read only estimates tab
        ],
      },
      {
        path: ":formId/edit",
        component: () => import("@/modules/travel-form/pages/TravelFormEdit"),
        props: true,
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            path: "details",
            name: "TravelFormEdit-DetailsTab",
            component: () => import("@/modules/travel-form/pages/travel-form-edit/DetailsTab"),
            props: true,
          },
          {
            path: "estimate",
            name: "TravelFormEdit-EstimateTab",
            component: () => import("@/modules/travel-form/pages/travel-form-edit/EstimateTab"),
            props: true,
          },
        ],
      },
      {
        name: "TravelFormManagerList",
        path: "/managerView",
        meta: {
          requiresAuth: true,
        },
        component: () => import("@/modules/travel-form/pages/ManagerView"),
      },
      {
        name: "travelRequestManage",
        path: "request/:formId?/manage",
        meta: {
          requiresAuth: true,
        },
        component: () => import("@/modules/travel-form/pages/TravelFormManage"),
      },
    ],
  },
]

export default routes
