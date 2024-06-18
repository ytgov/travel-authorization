<template>
  <PageLoader v-if="isNil(travelAuthorization.id)" />
  <div v-else>
    <Breadcrumbs />

    <div class="d-flex justify-space-between align-baseline my-5">
      <h1>
        Travel -
        <VUserChipMenu :user-id="currentUser.id" />
      </h1>
    </div>

    <v-card class="default">
      <v-card-text>
        <SummaryHeaderPanel :travel-authorization-id="travelAuthorizationId" />

        <div style="border: 1px #ddd solid">
          <v-tabs>
            <!-- TODO: add in any tabs that you can normally see in read-only mode -->
            <template
              v-for="({ component, tabName, props: componentProps }, index) in availableTabs"
            >
              <component
                :is="component"
                :key="index"
                v-bind="componentProps"
                >{{ tabName }}</component
              >
            </template>
          </v-tabs>
        </div>

        <router-view @state-changed="refresh"></router-view>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { toRefs, computed, defineAsyncComponent } from "vue"
import { isNil } from "lodash"

import { TRAVEL_METHODS } from "@/api/travel-segments-api"
import { TRAVEL_DESK_TRAVEL_REQUEST_STATUSES } from "@/api/travel-desk-travel-requests-api"
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorization, {
  STATUSES as TRAVEL_AUTHORIZATION_STATUSES,
} from "@/use/use-travel-authorization"

import Breadcrumbs from "@/components/Breadcrumbs"
import PageLoader from "@/components/PageLoader"
import SummaryHeaderPanel from "@/modules/travel-authorizations/components/SummaryHeaderPanel"
import VUserChipMenu from "@/components/VUserChipMenu"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { currentUser } = useCurrentUser()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, policy, refresh } = useTravelAuthorization(travelAuthorizationId)

const VTabComponent = defineAsyncComponent(() => import("vuetify/lib/components/VTabs/VTab"))
const LockedTab = defineAsyncComponent(() => import("@/components/common/LockedTab"))

const detailsTabComponent = computed(() => {
  if (policy.value?.update) {
    return {
      component: VTabComponent,
      tabName: "Details",
      props: {
        to: {
          name: "EditMyTravelAuthorizationDetailsPage",
          params: { travelAuthorizationId: travelAuthorizationId.value },
        },
      },
    }
  }

  return {
    component: VTabComponent,
    tabName: "Details",
    props: {
      to: {
        name: "ReadMyTravelAuthorizationDetailsPage",
        params: { travelAuthorizationId: travelAuthorizationId.value },
      },
    },
  }
})

const estimateTabComponent = computed(() => {
  if (policy.value?.update) {
    return {
      component: VTabComponent,
      tabName: "Estimate",
      props: {
        to: {
          name: "EditMyTravelAuthorizationEstimatePage",
          params: { travelAuthorizationId: travelAuthorizationId.value },
        },
      },
    }
  }

  return {
    component: VTabComponent,
    tabName: "Estimate",
    props: {
      to: {
        name: "ReadMyTravelAuthorizationEstimatePage",
        params: { travelAuthorizationId: travelAuthorizationId.value },
      },
    },
  }
})

const requestTabComponent = computed(() => {
  // TODO: lock on denied states.
  const isWaitingForApproval =
    travelAuthorization.value.status === TRAVEL_AUTHORIZATION_STATUSES.DRAFT ||
    travelAuthorization.value.status === TRAVEL_AUTHORIZATION_STATUSES.SUBMITTED
  const hasNoAirTravel = travelAuthorization.value.travelSegments.every(
    (segment) => segment.modeOfTransport !== TRAVEL_METHODS.AIRCRAFT
  )
  const isLocked = isWaitingForApproval || hasNoAirTravel

  const lockReasons = []
  if (isWaitingForApproval) {
    lockReasons.push("Travel authorization is waiting for approval.")
  }

  if (hasNoAirTravel) {
    lockReasons.push("Disabled as traveler is not traveling by air.")
  }

  if (isLocked === true) {
    return {
      component: LockedTab,
      tabName: "Request",
      props: {
        title: "Request",
        lockReasons,
      },
    }
  }

  if (
    travelAuthorization.value?.travelDeskTravelRequest?.status ===
    TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.DRAFT
  ) {
    return {
      component: VTabComponent,
      tabName: "Request",
      props: {
        to: {
          name: "MyTravelRequestsRequestEditPage",
          params: { travelAuthorizationId: travelAuthorizationId.value },
        },
      },
    }
  }

  return {
    component: VTabComponent,
    tabName: "Request",
    props: {
      to: {
        name: "MyTravelRequestsRequestReadPage",
        params: { travelAuthorizationId: travelAuthorizationId.value },
      },
    },
  }
})

const isBeforeTravelStartDate = computed(() => {
  const firstTravelSegment = travelAuthorization.value.travelSegments[0]
  if (isNil(firstTravelSegment)) return false

  return new Date(firstTravelSegment.departureOn) > new Date()
})

const expenseTabComponent = computed(() => {
  const isInPreExpensingStates =
    travelAuthorization.value.status === TRAVEL_AUTHORIZATION_STATUSES.DRAFT ||
    travelAuthorization.value.status === TRAVEL_AUTHORIZATION_STATUSES.SUBMITTED
  const isAfterTravelStartDate = !isBeforeTravelStartDate.value
  const isLocked = isInPreExpensingStates || isBeforeTravelStartDate.value
  const isEditable =
    travelAuthorization.value.status === TRAVEL_AUTHORIZATION_STATUSES.APPROVED &&
    isAfterTravelStartDate

  const lockReasons = []
  if (isInPreExpensingStates) {
    lockReasons.push("Travel authorization is in pre-expensing states (not approved).")
  }

  if (isBeforeTravelStartDate.value) {
    lockReasons.push("Travel has not started yet.")
  }

  if (isLocked === true) {
    return {
      component: LockedTab,
      tabName: "Expense",
      props: {
        title: "Expense",
        lockReasons,
      },
    }
  }

  if (isEditable) {
    return {
      component: VTabComponent,
      tabName: "Expense",
      props: {
        to: {
          name: "EditMyTravelAuthorizationExpensePage",
          params: { travelAuthorizationId: travelAuthorizationId.value },
        },
      },
    }
  }

  return {
    component: VTabComponent,
    tabName: "Expense",
    props: {
      to: {
        name: "ReadMyTravelAuthorizationExpensePage",
        params: { travelAuthorizationId: travelAuthorizationId.value },
      },
    },
  }
})

const availableTabs = computed(() => [
  detailsTabComponent.value,
  estimateTabComponent.value,
  requestTabComponent.value,
  expenseTabComponent.value,
])
</script>
