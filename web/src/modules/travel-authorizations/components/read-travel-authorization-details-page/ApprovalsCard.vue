<template>
  <v-card>
    <v-card-title> Approvals </v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <!-- TODO: add tooltip with link to estimate tab explaining where this data comes from -->
          <v-text-field
            :value="formatCurrency(estimatedCost)"
            label="Estimated Cost"
            disabled
            dense
            outlined
            readonly
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            :value="travelAdvanceInDollars"
            label="Travel Advance"
            prefix="$"
            dense
            outlined
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            :value="preApprovedTravelRequestText"
            :loading="isLoadingPreApprovedTravelRequests"
            label="Pre-approved Travel Request?"
            no-data-text="No pre-approvals available"
            dense
            outlined
            readonly
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            :value="travelAuthorization.supervisorEmail"
            label="Submit to"
            dense
            outlined
            readonly
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <TravelAuthorizationActionLogsTable
            ref="travelAuthorizationActionLogsTable"
            :travel-authorization-id="travelAuthorizationId"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { isNil, isEmpty, sumBy } from "lodash"
import { mapActions, mapGetters } from "vuex"

import TravelAuthorizationActionLogsTable from "@/modules/travel-authorizations/components/TravelAuthorizationActionLogsTable"

export default {
  name: "ApprovalsCard",
  components: {
    TravelAuthorizationActionLogsTable,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data: () => ({}),
  computed: {
    ...mapGetters("travelAuthorization", {
      travelAuthorization: "attributes",
      estimates: "estimates",
    }),
    ...mapGetters("preApprovedTravelRequests", {
      preApprovedTravelRequests: "items",
      isLoadingPreApprovedTravelRequests: "isLoading",
    }),
    estimatedCost() {
      return sumBy(this.estimates, "cost")
    },
    travelAuthorizationUser() {
      return this.travelAuthorization.user || {}
    },
    preApprovedTravelRequestText() {
      const preApprovedTravelRequest = this.preApprovedTravelRequests.find(
        (p) => p.value === this.travelAuthorization.preappId
      )

      if (isNil(preApprovedTravelRequest)) {
        return ""
      }

      const { preApprovedTravelers } = preApprovedTravelRequest
      const travelerNames = preApprovedTravelers
        .map((traveler) => traveler.fullName)
        .filter(Boolean)
      const { fullName: travelAuthorizationUserFullname } = this.travelAuthorizationUser

      if (isEmpty(travelerNames) || !travelerNames.includes(travelAuthorizationUserFullname)) {
        return `${preApprovedTravelRequest.purpose} - ${preApprovedTravelRequest.month}`
      }

      return `${preApprovedTravelRequest.purpose} - ${preApprovedTravelRequest.month} - ${travelAuthorizationUserFullname}`
    },
    travelAdvanceInDollars() {
      return Math.ceil(this.travelAuthorization.travelAdvanceInCents / 100.0)
    },
  },
  async mounted() {
    await this.ensureTravelAuthorization(this.travelAuthorizationId)
    const { department } = this.travelAuthorizationUser
    await this.ensurePreApprovedTravelRequests({ where: { department } })
  },
  methods: {
    ...mapActions("preApprovedTravelRequests", {
      ensurePreApprovedTravelRequests: "ensure",
    }),
    ...mapActions("travelAuthorization", {
      ensureTravelAuthorization: "ensure",
    }),
    refresh() {
      this.$refs.travelAuthorizationActionLogsTable.refresh()
    },
    formatCurrency(amount) {
      const formatter = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      })
      return formatter.format(amount)
    },
  },
}
</script>
