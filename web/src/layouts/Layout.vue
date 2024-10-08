<template>
  <v-app>
    <v-app-bar
      app
      color="#fff"
      flat
      height="70"
      style="left: 0; border-bottom: 3px #f3b228 solid"
    >
      <img
        src="/yukon.svg"
        style="margin: -8px 85px 0 0"
        height="44"
      />
      <v-toolbar-title>
        <h1 class="text-h6 font-weight-bold mb-0">{{ applicationName }}</h1>

        <v-progress-circular
          :class="loadingClass"
          indeterminate
          color="#f3b228"
          size="20"
          width="2"
          class="ml-4"
        ></v-progress-circular>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <div>
        <v-menu
          offset-y
          class="ml-0"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              text
              color="primary"
              :loading="isLoading"
              v-bind="attrs"
              v-on="on"
            >
              {{ menuTitle }}<v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </template>

          <v-list
            dense
            style="min-width: 200px"
          >
            <v-list-item
              to="/dashboard"
              @click="menuItemSelected('Dashboard')"
            >
              <v-list-item-title>Dashboard</v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'MyTravelAuthorizationsPage' }"
              @click="menuItemSelected('My Travel Requests')"
            >
              <v-list-item-title>My Travel Requests</v-list-item-title>
            </v-list-item>
            <v-list-item
              to="/preapproved"
              @click="menuItemSelected('PreApproved')"
            >
              <v-list-item-title>PreApproved</v-list-item-title>
            </v-list-item>
            <v-list-item
              to="/travel-desk"
              @click="menuItemSelected('Travel Desk')"
            >
              <v-list-item-title>Travel Desk </v-list-item-title>
            </v-list-item>
            <v-list-item
              to="/travel-request"
              @click="menuItemSelected('Travel Request')"
            >
              <v-list-item-title>Travel Request </v-list-item-title>
            </v-list-item>
            <v-list-item
              to="/flight-expense"
              @click="menuItemSelected('Flight Expense')"
            >
              <v-list-item-title>Flight Expense </v-list-item-title>
            </v-list-item>
            <v-list-item
              to="/reporting-summary"
              @click="menuItemSelected('Reports')"
            >
              <v-list-item-title>Reports </v-list-item-title>
            </v-list-item>
            <v-list-item
              :to="{ name: 'ManageTravelAuthorizationsPage' }"
              @click="menuItemSelected('Manager View')"
            >
              <v-list-item-title>Manager View</v-list-item-title>
            </v-list-item>
            <v-list-item
              v-if="isInDevelopmentOrUserAcceptanceTesting"
              :to="{ name: 'Qa-Scenarios' }"
              @click="menuItemSelected('QA Scenarios')"
            >
              <v-list-item-title>QA Scenarios</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn
          icon
          color="primary"
          class="mr-2"
          title="Recently visited"
          @click="showHistory"
        >
          <v-icon>mdi-history</v-icon>
        </v-btn>

        <span>{{ username }}</span>
        <v-menu
          bottom
          left
          class="ml-0"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              title="System Options"
              icon
              color="primary"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list
            dense
            style="min-width: 200px"
          >
            <v-list-item to="/profile">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-title>My profile</v-list-item-title>
            </v-list-item>
            <v-list-item :to="{ name: 'AdministrationPage' }">
              <v-list-item-icon>
                <v-icon>mdi-cogs</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Administration</v-list-item-title>
            </v-list-item>

            <v-divider />
            <v-list-item :to="{ name: 'HealthCheck' }">
              <v-list-item-icon>
                <v-icon>mdi-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{ releaseTag || "2023.11.01" }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="signOut">
              <v-list-item-icon>
                <v-icon>mdi-exit-run</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Sign out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <!-- <v-app-bar-nav-icon @click.stop="drawerRight = !drawerRight"></v-app-bar-nav-icon> -->
    </v-app-bar>

    <v-main :style="{ 'padding-left: 33px !important': !hasSidebar }">
      <PageLoader v-if="isLoading" />
      <!-- Provides the application the proper gutter -->
      <v-container
        v-else
        fluid
        class="h-full"
      >
        <router-view></router-view>
        <RequestAlert />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapState } from "vuex"

import {
  ENVIRONMENT,
  RELEASE_TAG,
  APPLICATION_NAME,
  HAS_SIDEBAR,
  HAS_SIDEBAR_CLOSABLE,
} from "@/config"
import { auth0 } from "@/plugins/auth0-plugin"
import router from "@/router"
import store from "@/store"

import useCurrentUser from "@/use/use-current-user"

import RequestAlert from "@/components/RequestAlert.vue"
import PageLoader from "@/components/PageLoader.vue"

const { unset: unsetCurrentUser } = useCurrentUser()

export default {
  name: "App",
  components: {
    RequestAlert,
    PageLoader,
  },
  data: () => ({
    releaseTag: RELEASE_TAG,
    dialog: false,
    drawer: null,
    drawerRight: null,
    headerShow: false,
    menuShow: false,
    loadingClass: "d-none",
    applicationName: APPLICATION_NAME,
    hasSidebar: HAS_SIDEBAR,
    hasSidebarClosable: HAS_SIDEBAR_CLOSABLE,
    currentId: 0,
    menuTitle: "Dashboard",

    isLoading: true,
  }),
  computed: {
    ...mapState(["isAuthenticated", "user", "showAppSidebar"]),
    username() {
      return store.getters.fullName
    },
    isAuthenticated() {
      //return true; // until we get auth process to show sidebar
      return store.getters.isAuthenticated
    },
    user() {
      return store.getters.user
    },
    showAppSidebar() {
      return store.getters.showAppSidebar
    },
    isInDevelopmentOrUserAcceptanceTesting() {
      return (
        ENVIRONMENT === "development" ||
        window.location.hostname === "travel-auth-dev.ynet.gov.yk.ca"
      )
    },
  },
  watch: {
    isAuthenticated: function (val) {
      if (!val) this.hasSidebar = false
      else this.hasSidebar = store.getters.showAppSidebar
    },
    showAppSidebar: function (val) {
      if (val) {
        this.currentId = this.$route.params.id
      }

      this.hasSidebar = val && this.isAuthenticated
    },
    $route: function () {
      this.getDropdownTitle()
    },
  },
  async mounted() {
    this.doInitialize()
  },
  methods: {
    nav: function (location) {
      router.push(location)
    },
    signOut() {
      unsetCurrentUser()

      const returnTo = encodeURI(window.location.origin + "/sign-in")
      return auth0.logout({
        logoutParams: {
          returnTo,
        },
      })
    },
    showHistory() {
      this.$refs.historySidebar.show()
    },
    showError: function (msg) {
      this.$refs.notifier.showError(msg)
    },
    showSuccess: function (msg) {
      this.$refs.notifier.showSuccess(msg)
    },
    showAPIMessages: function (msg) {
      this.$refs.notifier.showAPIMessages(msg)
    },
    menuItemSelected(title) {
      this.menuTitle = title
    },
    async doInitialize() {
      //await this.initialize();
      this.isLoading = false
      this.getDropdownTitle()
    },
    getDropdownTitle() {
      const path = this.$route.path
      const routes = [
        { name: "Dashboard", to: "/dashboard" },
        { name: "My Travel Requests", to: { name: "MyTravelAuthorizationsPage" } },
        { name: "PreApproved", to: "/preapproved" },
        { name: "Travel Desk", to: { name: "TravelDeskPage" } },
        { name: "Travel Request", to: "/travel-request" },
        { name: "Flight Expense", to: "/flight-expense" },
        { name: "Reports", to: "/reporting-summary" },
        { name: "Manager View", to: { name: "ManageTravelAuthorizationsPage" } },
      ]

      if (this.isInDevelopmentOrUserAcceptanceTesting) {
        routes.push({ name: "QA Scenarios", to: { name: "Qa-Scenarios" } })
      }

      for (const route of routes) {
        if (this.$route.name === route.to.name || path.includes(route.to)) {
          this.menuTitle = route.name
          break
        }
      }
    },
  },
}
</script>

<style scoped>
.h-full {
  height: 100%;
}
</style>
