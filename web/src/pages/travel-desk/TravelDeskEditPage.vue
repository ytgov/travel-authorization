<template>
  <v-card>
    <v-card-title>
      <h2>Travel Desk Request</h2>
    </v-card-title>

    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <v-card-text v-else>
      <v-row class="mb-3">
        <v-col cols="8">
          <TravelerDetails
            :traveler-details="travelDeskTravelRequest"
            :readonly="readonly"
          />

          <TitleCard
            class="mt-10"
            large-title
          >
            <template #title>
              <div>Travel Information</div>
            </template>
            <template #body>
              <v-row
                v-if="!readonly"
                class="mt-n2 mb-n9 mr-5"
              >
                <TravelPortModal
                  :flight-requests="travelDeskTravelRequest.flightRequests"
                  :travel-desk-travel-request-id="travelDeskTravelRequest.id"
                  class="my-1 ml-auto"
                  @close="flightKey++"
                />
              </v-row>
              <title-card class="mt-9 mx-5">
                <template #title>
                  <div>Flight Request</div>
                </template>
                <template #body>
                  <v-row class="m-0 p-0">
                    <v-col
                      cols="9"
                      class="my-0 mx-0 py-4"
                    >
                      <FlightRequestTable
                        :key="flightKey"
                        class="mr-n5 mt-n1"
                        :readonly="readonly"
                        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
                        show-flight-options
                        travel-desk-user
                        :flight-requests="travelDeskTravelRequest.flightRequests"
                      />
                    </v-col>
                    <v-col
                      cols="3"
                      class="px-0"
                    >
                      <v-textarea
                        v-model="travelDeskTravelRequest.additionalInformation"
                        class="mt-3 ml-0 mr-5"
                        :readonly="readonly"
                        label="Additional Information"
                        outlined
                        auto-grow
                        counter
                        :rules="[
                          (v) => (v || '').length <= 255 || 'Must be 255 characters or less',
                        ]"
                        :clearable="!readonly"
                      />
                    </v-col>
                  </v-row>
                </template>
              </title-card>
              <RentalCarRequestTable
                :readonly="readonly"
                :flight-requests="travelDeskTravelRequest.flightRequests"
                :rental-cars="travelDeskTravelRequest.rentalCars"
              />
              <HotelRequestTable
                :readonly="readonly"
                :flight-requests="travelDeskTravelRequest.flightRequests"
                :hotels="travelDeskTravelRequest.hotels"
              />
              <TransportationRequestTable
                :readonly="readonly"
                :other-transportations="travelDeskTravelRequest.otherTransportations"
              />
            </template>
          </TitleCard>
        </v-col>
        <v-col cols="4">
          <v-row class="mt-3 mb-0 mx-0">
            <v-col cols="6">
              <TravelDeskTravelAgencySelect
                v-model="travelDeskTravelRequest.travelAgencyId"
                label="Assign Agency"
                placeholder="None"
                clearable
                outlined
                persistent-placeholder
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="travelDeskTravelRequest.travelDeskOfficer"
                :readonly="readonly"
                class="mr-2"
                :items="travelDeskAgentList"
                label="Travel Desk Agent Assigned"
                outlined
              />
            </v-col>
          </v-row>
          <v-row
            v-if="travelDeskTravelRequest.invoiceNumber"
            class="mx-0 mb-5 mt-n6"
          >
            <TitleCard
              class="mt-10 mx-4"
              style="width: 100%"
            >
              <template #title>
                <div>Invoice</div>
              </template>
              <template #body>
                <v-row class="mx-0 mt-0 mb-2">
                  <div
                    style="font-size: 13pt"
                    class="my-auto ml-4 primary--text"
                  >
                    Invoice Number: {{ travelDeskTravelRequest.invoiceNumber }}
                  </div>
                  <v-btn
                    class="ml-auto mr-3 px-5"
                    color="secondary"
                    :loading="savingData"
                    @click="downloadPdf"
                  >
                    <div style="font-size: 13pt">Download PNR</div>
                  </v-btn>
                </v-row>
              </template>
            </TitleCard>
          </v-row>
          <QuestionsTable
            :readonly="readonly"
            :travel-desk-user="true"
            :questions="travelDeskTravelRequest.questions"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="actions"
    />
    <v-card-actions v-else>
      <v-btn
        color="grey darken-5"
        class="px-5"
        :to="{
          name: 'TravelDeskPage',
        }"
      >
        <div>Back</div>
      </v-btn>
      <ItineraryModal
        v-if="travelDeskTravelRequest.invoiceNumber"
        class="ml-auto mr-3"
        :invoice-number="travelDeskTravelRequest.invoiceNumber"
      />
      <UploadPnrModal
        :travel-request="travelDeskTravelRequest"
        :class="travelDeskTravelRequest.invoiceNumber ? 'ml-1 mr-2' : 'ml-auto mr-2'"
        @saveData="saveNewTravelRequest('save')"
        @close="refresh"
      />
      <v-btn
        v-if="!readonly"
        class="ml-2 mr-2 px-5"
        color="#005A65"
        :loading="savingData"
        @click="saveNewTravelRequest('save')"
        >Save Draft
      </v-btn>
      <v-btn
        v-if="!readonly"
        class="mr-2 px-5"
        color="secondary"
        :loading="savingData"
        @click="saveNewTravelRequest('sendback', { returnToTravelDeskPageAfter: true })"
        >Send to Traveler
      </v-btn>

      <v-btn
        v-if="!readonly && travelDeskTravelRequest.invoiceNumber"
        class="mr-5 px-5"
        color="#005A65"
        :loading="savingData"
        @click="openConfirmBookingDialog"
        >Booking Complete
      </v-btn>
    </v-card-actions>

    <TravelDeskTravelRequestConfirmBookingDialog
      ref="confirmBookingDialog"
      @booked="refresh"
    />
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import { useStore } from "vue2-helpers/vuex"
import { useRouter } from "vue2-helpers/vue-router"
import { cloneDeep, isNil } from "lodash"

import { TRAVEL_DESK_URL } from "@/urls"
import { useSnack } from "@/plugins/snack-plugin"
import http from "@/api/http-client"
import { TRAVEL_DESK_TRAVEL_REQUEST_STATUSES } from "@/api/travel-desk-travel-requests-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"
import TravelerDetails from "@/modules/travelDesk/views/Requests/Components/TravelerDetails.vue"
import FlightRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/FlightRequestTable.vue"
import RentalCarRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/RentalCarRequestTable.vue"
import HotelRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/HotelRequestTable.vue"
import TransportationRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/TransportationRequestTable.vue"
import TravelPortModal from "@/modules/travelDesk/views/Desk/Components/TravelPortModal.vue"

import UploadPnrModal from "@/modules/travelDesk/views/Desk/PnrDocument/UploadPnrModal.vue"
import QuestionsTable from "@/modules/travelDesk/views/Desk/Components/QuestionsTable.vue"
import ItineraryModal from "@/modules/travelDesk/views/Requests/Components/ItineraryModal.vue"

import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"
import TravelDeskTravelRequestConfirmBookingDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestConfirmBookingDialog.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: [Number, String],
    required: true,
  },
})

const snack = useSnack()
const { currentUser } = useCurrentUser()

const addNewTravelDialog = ref(false)

const travelDeskTravelRequest = ref(null)
const readonly = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED
)
const savingData = ref(false)
const flightKey = ref(0)
const isLoading = ref(false)

const store = useStore()
const travelDeskAgentList = computed(() =>
  store.state.traveldesk.travelDeskUsers.map(({ firstName, lastName }) =>
    [firstName, lastName].join(" ")
  )
)

watch(
  () => props.travelDeskTravelRequestId,
  (newTravelDeskTravelRequestId) => {
    if (isNil(newTravelDeskTravelRequestId)) {
      addNewTravelDialog.value = false
    } else {
      addNewTravelDialog.value = true
      refresh()
    }
  },
  {
    immediate: true,
  }
)

async function refresh() {
  travelDeskTravelRequest.value = await fetchTravelDeskTravelRequest(
    props.travelDeskTravelRequestId
  )

  if (isNil(travelDeskTravelRequest.value.travelDeskOfficer)) {
    travelDeskTravelRequest.value.travelDeskOfficer = currentUser.value.displayName
  }

  travelDeskTravelRequest.value.internationalTravel =
    travelDeskTravelRequest.value.passportCountry || travelDeskTravelRequest.value.passportNum
}

async function fetchTravelDeskTravelRequest(travelDeskTravelRequestId) {
  isLoading.value = true
  try {
    const { data } = await http.get(
      `${TRAVEL_DESK_URL}/travel-request/${travelDeskTravelRequestId}`
    )

    if (isNil(data)) {
      snack.error("Failed to load travel request.")
      return
    }
    return data
  } catch (error) {
    console.log(error)
    snack.error(`Failed to load travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const router = useRouter()

async function saveNewTravelRequest(saveType, { returnToTravelDeskPageAfter = false } = {}) {
  const body = cloneDeep(travelDeskTravelRequest.value)
  delete body.internationalTravel
  delete body.differentTravelContact
  delete body.office
  delete body.department
  delete body.fullName

  // TODO: move status updates to state specific endpoints
  if (saveType == "save") {
    // no-op
  } else if (saveType == "sendback") {
    body.status = TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.OPTIONS_PROVIDED
  } else if (saveType == "booked") {
    body.status = TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED
  }

  savingData.value = true
  try {
    await http.post(`${TRAVEL_DESK_URL}/travel-request/${props.travelDeskTravelRequestId}`, body)

    snack.success("Travel request saved.", {
      color: "success",
    })
    savingData.value = false

    if (returnToTravelDeskPageAfter) {
      return router.push({
        name: "TravelDeskPage",
      })
    } else {
      refresh()
    }
  } catch (error) {
    console.error(error)
    snack.error(`Failed to save travel request: ${error}`)
  } finally {
    savingData.value = false
  }
}

async function downloadPdf() {
  savingData.value = true
  try {
    const { data } = await http.get(
      `${TRAVEL_DESK_URL}/pnr-document/${props.travelDeskTravelRequestId}`,
      {
        responseType: "application/pdf",
        headers: {
          "Content-Type": "application/text",
        },
      }
    )

    const link = document.createElement("a")
    link.href = data
    document.body.appendChild(link)
    link.download = "pnr_doc.pdf"
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.log(error)
    snack.error(`Failed to download PNR: ${error}`)
  } finally {
    savingData.value = false
  }
}

const confirmBookingDialog = ref(null)

function openConfirmBookingDialog() {
  confirmBookingDialog.value.open(props.travelDeskTravelRequestId)
}

useBreadcrumbs([
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  // TODO: Replace with read-only route once that exists.
  {
    text: "Request",
    to: {
      name: "TravelDeskEditPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
  {
    text: "Edit",
    to: {
      name: "TravelDeskEditPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
</script>

<style scoped></style>
