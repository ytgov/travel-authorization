<template>
  <v-card
    :loading="loadingData"
    :disabled="loadingData"
    en
    class="px-5 pb-15"
  >
    <div
      v-if="loadingData"
      class="mt-10"
      style="text-align: center"
    >
      loading ...
    </div>
    <v-alert
      v-if="alertMsg"
      class="mt-5"
      type="warning"
      >{{ alertMsg }}</v-alert
    >
    <v-toolbar
      v-if="!loadingData"
      class=""
      height="100px"
      flat
    >
      <v-toolbar-title>Pre-Approved Travel</v-toolbar-title>

      <template #extension>
        <v-tabs
          v-model="tabs"
          active-class="primary--text teal lighten-5"
        >
          <v-tab>Requests</v-tab>
          <v-tab>Submissions</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items
      v-if="!loadingData"
      v-model="tabs"
    >
      <v-tab-item>
        <v-card flat>
          <PreapprovedRequests
            :travel-requests="travelRequests"
            @updateTable="updatePreapprovedTravel"
          />
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
          <Submissions
            :travel-submissions="travelSubmissions"
            :travel-requests="travelRequests"
            @updateTable="updatePreapprovedTravel"
          />
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import http from "@/api/http-client"
import { PREAPPROVED_URL, LOOKUP_URL } from "@/urls"

import usersApi from "@/api/users-api"
import travelPurposesApi from "@/api/travel-purposes-api"
import travelAuthorizationPreApprovalsApi, {
  STATUSES,
} from "@/api/travel-authorization-pre-approvals-api"

import PreapprovedRequests from "./Requests/PreapprovedRequests.vue"
import Submissions from "./Submissions/Submissions.vue"

export default {
  name: "Preapproved",
  components: {
    PreapprovedRequests,
    Submissions,
  },
  data() {
    return {
      tabs: null,
      travelRequests: [],
      loadingData: false,
      travelSubmissions: [],
      alertMsg: "",
    }
  },
  async mounted() {
    this.loadingData = true
    await this.getUserAuth()
    await this.getEmployees()
    await this.getDepartmentBranch()
    await this.getTravelPurposes()
    await this.getPreapprovedTravel()
    await this.getPreapprovedTravelSubmissions()
    this.determineDepartment()
    this.loadingData = false
  },
  methods: {
    async updatePreapprovedTravel() {
      this.loadingData = true
      await this.getPreapprovedTravel()
      await this.getPreapprovedTravelSubmissions()
      this.determineDepartment()
      this.loadingData = false
    },

    async getUserAuth() {
      return usersApi
        .me()
        .then(({ user }) => {
          this.$store.commit("auth/setUser", user)
        })
        .catch((error) => {
          console.error(error)
        })
    },

    async getEmployees() {
      return http
        .get(`${LOOKUP_URL}/employees`)
        .then((resp) => {
          this.$store.commit("preapproved/SET_EMPLOYEES", resp.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getDepartmentBranch() {
      return http
        .get(`${LOOKUP_URL}/department-branch`)
        .then((resp) => {
          this.$store.commit("preapproved/SET_DEPARTMENT_BRANCH", resp.data)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getTravelPurposes() {
      return travelPurposesApi
        .list()
        .then(({ travelPurposes }) => {
          this.$store.commit("preapproved/SET_TRAVEL_PURPOSES", travelPurposes)
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getPreapprovedTravel() {
      try {
        const { travelAuthorizationPreApprovals } = await travelAuthorizationPreApprovalsApi.list()
        this.travelRequests = travelAuthorizationPreApprovals.map((preApproval) => ({
          ...preApproval,
          isSelectable:
            preApproval.status !== STATUSES.APPROVED && preApproval.status !== STATUSES.DECLINED,
        }))
      } catch (error) {
        console.error(error)
        throw error
      }
    },

    async getPreapprovedTravelSubmissions() {
      return http
        .get(`${PREAPPROVED_URL}/submissions`)
        .then((resp) => {
          this.travelSubmissions = resp.data
        })
        .catch((e) => {
          console.log(e)
        })
    },

    determineDepartment() {
      this.alertMsg = ""
      if (!this.$store.state.auth.department) {
        const email = this.$store.state.auth.user.email
        const employee = this.$store.state.preapproved.employees.filter((emp) => emp.email == email)
        if (employee.length > 0) {
          this.$store.dispatch("UpdateUserDepartment", employee[0].department)
        } else {
          this.alertMsg = "Your department is undefined. Please contact system administrator."
        }
      }
      this.loadingData = false
    },
  },
}
</script>
