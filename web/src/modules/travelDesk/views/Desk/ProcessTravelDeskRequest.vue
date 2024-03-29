<template>
  <div>
    <v-dialog
      v-model="addNewTravelDialog"
      persistent
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          style="min-width: 0; height: 1.75rem"
          class="my-0 mx-0 px-0"
          color="primary"
          @click="initForm()"
          v-bind="attrs"
          v-on="on"
        >
          <div class="mx-0 px-1"><v-icon style="font-size: 15pt">mdi-pencil</v-icon></div>
        </v-btn>
      </template>

      <v-card
        :loading="loadingData"
        :disabled="loadingData"
        en
      >
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Travel Desk Request</div>
        </v-card-title>

        <div
          v-if="loadingData"
          class="mt-10"
          style="text-align: center"
        >
          loading ...
        </div>
        <v-card-text v-if="!loadingData">
          <v-row class="mb-3">
            <v-col cols="8">
              <traveler-details
                :travelerDetails="travelRequest"
                :travelerState="state"
                :readonly="readonly"
              />

              <title-card
                class="mt-10"
                titleWidth="12.5rem"
                largeTitle
              >
                <template #title>
                  <div>Travel Information</div>
                </template>
                <template #body>
                  <v-row
                    v-if="!readonly"
                    class="mt-n2 mb-n9 mr-5"
                  >
                    <travel-port-modal
                      :flightRequests="travelRequest.flightRequests"
                      :travel-desk-travel-request-id="travelDetail.id"
                      @close="flightKey++"
                      class="my-1 ml-auto"
                    />
                  </v-row>
                  <title-card
                    class="mt-9 mx-5"
                    titleWidth="8.5rem"
                  >
                    <template #title>
                      <div>Flight Request</div>
                    </template>
                    <template #body>
                      <v-row class="m-0 p-0">
                        <v-col
                          cols="9"
                          class="my-0 mx-0 py-4"
                        >
                          <flight-request-table
                            :key="flightKey"
                            class="mr-n5 mt-n1"
                            :readonly="readonly"
                            :travel-desk-travel-request-id="travelDetail.id"
                            showFlightOptions
                            travelDeskUser
                            :flightRequests="travelRequest.flightRequests"
                          />
                        </v-col>
                        <v-col
                          cols="3"
                          class="px-0"
                        >
                          <v-textarea
                            class="mt-3 ml-0 mr-5"
                            :readonly="readonly"
                            v-model="travelRequest.additionalInformation"
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
                  <rental-car-request-table
                    :readonly="readonly"
                    :flightRequests="travelRequest.flightRequests"
                    :rentalCars="travelRequest.rentalCars"
                  />
                  <hotel-request-table
                    :readonly="readonly"
                    :flightRequests="travelRequest.flightRequests"
                    :hotels="travelRequest.hotels"
                  />
                  <transportation-request-table
                    :readonly="readonly"
                    :otherTransportations="travelRequest.otherTransportation"
                  />
                </template>
              </title-card>
            </v-col>
            <v-col cols="4">
              <v-row class="mt-3 mb-0 mx-0">
                <v-col cols="6">
                  <v-select
                    v-model="travelRequest.travelDeskTravelAgentId"
                    :items="travelAgentsInfo"
                    item-text="agencyName"
                    item-value="agencyID"
                    label="Assign Agent"
                    outlined
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    :readonly="readonly"
                    class="mr-2"
                    :items="travelDeskAgentList"
                    label="Travel Desk Agent Assigned"
                    v-model="travelRequest.travelDeskOfficer"
                    outlined
                  />
                </v-col>
              </v-row>
              <v-row
                class="mx-0 mb-5 mt-n6"
                v-if="travelRequest.invoiceNumber"
              >
                <title-card
                  class="mt-10 mx-4"
                  titleWidth="4rem"
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
                        Invoice Number: {{ travelRequest.invoiceNumber }}
                      </div>
                      <v-btn
                        class="ml-auto mr-3 px-5"
                        color="secondary"
                        @click="downloadPdf()"
                        :loading="savingData"
                      >
                        <div style="font-size: 13pt">Download PNR</div>
                      </v-btn>
                    </v-row>
                  </template>
                </title-card>
              </v-row>
              <questions-table
                :readonly="readonly"
                :travelDeskUser="true"
                :questions="travelRequest.questions"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            class="px-5"
            @click="closeDialog"
          >
            <div>Close</div>
          </v-btn>
          <itinerary-modal
            class="ml-auto mr-3"
            v-if="travelRequest.invoiceNumber"
            :invoiceNumber="travelRequest.invoiceNumber"
          />
          <upload-pnr-modal
            @saveData="saveNewTravelRequest('save', false, false)"
            @close="initForm()"
            :travelAgentsInfo="travelAgentsInfo"
            :travelRequest="travelRequest"
            :class="travelRequest.invoiceNumber ? 'ml-1 mr-2' : 'ml-auto mr-2'"
          />
          <v-btn
            v-if="!readonly"
            class="ml-2 mr-2 px-5"
            color="#005A65"
            @click="saveNewTravelRequest('save', false, false)"
            :loading="savingData"
            >Save Draft
          </v-btn>
          <v-btn
            v-if="!readonly"
            class="mr-2 px-5"
            color="secondary"
            @click="saveNewTravelRequest('sendback', true, false)"
            :loading="savingData"
            >Send to Traveler
          </v-btn>

          <v-btn
            v-if="!readonly && travelRequest.invoiceNumber"
            class="mr-5 px-5"
            color="#005A65"
            @click="confirmBookingDialog = true"
            :loading="savingData"
            >Booking Complete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="confirmBookingDialog"
      persistent
      width="30%"
    >
      <v-card
        :loading="loadingData"
        :disabled="loadingData"
        en
      >
        <v-card-title class="warning">
          <div class="text-h5">Confirm Booking is Complete</div>
        </v-card-title>
        <v-card-text>
          <p class="mt-5">
            Are you sure this booking is Complete?<br />
            Once a booking is completed, you can no longer make changes to it.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="grey darken-5"
            class="px-5"
            @click="confirmBookingDialog = false"
          >
            <div>Cancel</div>
          </v-btn>
          <v-btn
            v-if="!readonly"
            class="mr-0 ml-auto px-5"
            color="#005A65"
            @click="saveNewTravelRequest('booked', false, true)"
            :loading="savingData"
            >Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from "vue"
import { TRAVEL_DESK_URL } from "../../../../urls"
import { secureGet, securePost } from "@/store/jwt"
import TitleCard from "../Common/TitleCard.vue"
import TravelerDetails from "../Requests/Components/TravelerDetails.vue"
import FlightRequestTable from "../Requests/RequestDialogs/FlightRequestTable.vue"
import RentalCarRequestTable from "../Requests/RequestDialogs/RentalCarRequestTable.vue"
import HotelRequestTable from "../Requests/RequestDialogs/HotelRequestTable.vue"
import TransportationRequestTable from "../Requests/RequestDialogs/TransportationRequestTable.vue"
import TravelPortModal from "./Components/TravelPortModal.vue"

import UploadPnrModal from "./PnrDocument/UploadPnrModal.vue"

import QuestionsTable from "./Components/QuestionsTable.vue"
import ItineraryModal from "../Requests/Components/ItineraryModal.vue"

export default {
  components: {
    TitleCard,
    TravelerDetails,
    FlightRequestTable,
    RentalCarRequestTable,
    TransportationRequestTable,
    HotelRequestTable,
    QuestionsTable,
    TravelPortModal,
    UploadPnrModal,
    ItineraryModal,
  },
  name: "ProcessTravelDeskRequest",
  props: {
    type: {
      type: String,
    },
    travelDetail: {},
  },
  data() {
    return {
      addNewTravelDialog: false,
      confirmBookingDialog: false,
      readonly: false,
      internationalTravel: false,
      travelDeskAgentList: [],
      travelerDetails: {},
      savingData: false,
      travelRequest: {},
      flightKey: 0,

      state: {
        firstNameErr: false,
        middleNameErr: false,
        lastNameErr: false,
        birthDateErr: false,
        travelAuthErr: false,
        addressErr: false,
        cityErr: false,
        provinceErr: false,
        postalCodeErr: false,
        passportNumberErr: false,
        passportCountryErr: false,
        businessPhoneErr: false,
        businessEmailErr: false,
        travelPhoneErr: false,
        travelEmailErr: false,
        flightRequestsErr: false,
        rentalCarsErr: false,
        hotelsErr: false,
        otherTransportationErr: false,
      },
      travelAgentsInfo: [],
      agencyID: null,
      loadingData: false,
    }
  },
  mounted() {},
  methods: {
    updateTable() {
      this.$emit("updateTable")
    },

    async initForm() {
      this.initStates()
      this.savingData = false
      this.loadingData = true
      const travelAuthorizationId = this.travelDetail.travelAuthorizationId
      this.travelRequest = await this.getTravelRequestInfo(travelAuthorizationId)
      this.travelAgentsInfo = await this.getTravelAgentsInfo()
      this.travelAgentsInfo.push({ agencyID: null, agencyName: "None", agencyInfo: "" })
      this.readonly = this.type == "booked" || this.travelRequest.status == "booked"
      const agents = this.$store.state.traveldesk.travelDeskUsers
      this.travelDeskAgentList = agents.map((agent) => agent.first_name + " " + agent.last_name)
      if (!this.travelRequest.travelDeskOfficer) {
        const usrEmail = this.$store.state.auth.user.email
        const currentUser = agents.filter((agent) => agent.email == usrEmail)[0]
        if (currentUser)
          this.travelRequest.travelDeskOfficer =
            currentUser.first_name + " " + currentUser.last_name
      }
      this.travelRequest.internationalTravel =
        this.travelRequest.passportCountry || this.travelRequest.passportNum
      Vue.nextTick(() => (this.loadingData = false))
    },

    closeDialog() {
      this.updateTable()
      this.addNewTravelDialog = false
    },

    async getTravelRequestInfo(taid) {
      return secureGet(`${TRAVEL_DESK_URL}/travel-request/` + taid)
        .then((resp) => {
          // console.log(resp.data)
          return resp.data
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getTravelAgentsInfo() {
      return secureGet(`${TRAVEL_DESK_URL}/travel-agents/`)
        .then((resp) => {
          return resp.data
        })
        .catch((e) => {
          console.log(e)
        })
    },

    saveNewTravelRequest(saveType, close, refresh) {
      console.log(saveType)
      console.log(close)
      // 	console.log(this.travelerDetails)

      if (saveType == "save" || this.checkFields()) {
        this.savingData = true
        const body = this.travelRequest
        delete body.internationalTravel
        delete body.differentTravelContact
        delete body.office
        delete body.department
        delete body.fullName
        console.log(body)
        if (saveType == "sendback") {
          body.status = "options_provided"
          //TODO EMail
        } else if (saveType == "booked") {
          body.status = "booked"
        }

        const travelAuthorizationId = this.travelRequest.travelAuthorizationId
        securePost(`${TRAVEL_DESK_URL}/travel-request/${travelAuthorizationId}`, body)
          .then(() => {
            this.savingData = false
            this.confirmBookingDialog = false
            if (close) this.closeDialog()
            if (refresh) this.initForm()
          })
          .catch((e) => {
            this.savingData = false
            console.log(e)
          })
      }
    },

    initStates() {
      for (const key of Object.keys(this.state)) {
        this.state[key] = false
      }
    },

    checkFields() {
      this.state.firstNameErr = this.travelRequest.legalFirstName ? false : true
      ;(this.state.middleNameErr = false),
        (this.state.lastNameErr = this.travelRequest.legalLastName ? false : true)
      this.state.birthDateErr = this.travelRequest.birthDate ? false : true
      this.state.travelAuthErr = false
      this.state.addressErr = this.travelRequest.strAddress ? false : true
      this.state.cityErr = this.travelRequest.city ? false : true
      this.state.provinceErr = this.travelRequest.province ? false : true
      this.state.postalCodeErr = this.travelRequest.postalCode ? false : true
      this.state.passportNumberErr =
        this.internationalTravel && !this.travelRequest.passportNum ? true : false
      this.state.passportCountryErr =
        this.internationalTravel && !this.travelRequest.passportCountry ? true : false
      this.state.businessPhoneErr = this.travelRequest.busPhone ? false : true
      this.state.businessEmailErr = this.travelRequest.busEmail ? false : true
      this.state.travelPhoneErr =
        this.travelRequest.travelContact && !this.travelRequest.travelPhone ? true : false //show hint
      this.state.travelEmailErr =
        this.travelRequest.travelContact && !this.travelRequest.travelEmail ? true : false //show hint
      this.state.flightRequestsErr = false
      this.state.rentalCarsErr = false
      this.state.hotelsErr = false
      this.state.otherTransportationErr = false

      let error = false
      for (const question of this.travelRequest.questions) {
        if (question.question) question.state.questionErr = false
        else {
          question.state.questionErr = true
          error = true
        }
      }
      if (error) return false

      for (const key of Object.keys(this.state)) {
        if (this.state[key]) return false
      }
      return true
    },

    downloadPdf() {
      this.savingData = true
      const header = {
        responseType: "application/pdf",
        headers: {
          "Content-Type": "application/text",
        },
      }
      const travelDeskTravelRequestId = this.travelRequest.id

      secureGet(`${TRAVEL_DESK_URL}/pnr-document/${travelDeskTravelRequestId}`, header)
        .then((res) => {
          this.savingData = false
          const link = document.createElement("a")
          link.href = res.data
          document.body.appendChild(link)
          link.download = "pnr_doc.pdf"
          link.click()
          setTimeout(() => URL.revokeObjectURL(link.href), 1000)
        })
        .catch((e) => {
          this.savingData = false
          console.log(e)
        })
    },
  },
}
</script>

<style scoped></style>
