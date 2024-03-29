import Vue from "vue"
import VueApexCharts from "vue-apexcharts"
import axios from "axios"

import vuetify from "@/plugins/vuetify"
import SnackPlugin from "@/plugins/snack-plugin"
import createI18n from "@/plugins/vue-i18n-plugin"
import { Auth0Plugin } from "@/auth"

import App from "@/App"
import router from "@/router"
import store from "@/store"
import "@/filters"
import Notifications from "@/components/Notifications"
import MapDialog from "@/components/MapDialog"

import { environment, apiBaseUrl, releaseTag, gitCommitHash } from "@/config"

Vue.use(VueApexCharts)

Vue.use(Auth0Plugin, {
  // domain,
  // client_id: clientId,
  // audience,
  onRedirectCallback: (appState) => {
    router.push(appState && appState.targetUrl ? appState.targetUrl : window.location.pathname)
  },
})
Vue.use(SnackPlugin)
const i18n = createI18n(Vue)

Vue.config.productionTip = false
Vue.prototype.$http = axios

Vue.directive("yk-btn", {
  bind: function (el) {
    el.style.backgroundColor = "#a000bb"
    el.style.color = "#fff"
    el.style.fontWeight = "400"
    el.style.textTransform = "none"
    el.style.borderRadius = "0"
  },
})

Vue.component("notifier", Notifications)
Vue.component("map-dialog", MapDialog)
Vue.component("apexchart", VueApexCharts)

axios.defaults.withCredentials = true
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*"

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
}).$mount("#app")

console.log("App is running", {
  environment,
  apiBaseUrl,
  releaseTag,
  gitCommitHash,
})
