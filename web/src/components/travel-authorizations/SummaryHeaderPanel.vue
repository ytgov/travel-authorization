<template>
  <v-card>
    <v-card-text>
      <v-row dense>
        <v-col
          class="d-flex align-center justify-center justify-md-start"
          :cols="mdAndUp ? undefined : 12"
        >
          <h2 class="mb-0">Travel</h2>
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Purpose"
            :vertical="mdAndUp"
          >
            <TravelPurposeChip
              v-show="travelPurposeId"
              :travel-purpose-id="travelPurposeId"
            />
          </DescriptionElement>
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <LocationDescriptionElement
            label="Final Destination"
            :location-id="finalDestinationLocationId"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Depart"
            :value="departureDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Return"
            :value="returnDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          class="d-flex align-center justify-center justify-md-start"
          :cols="mdAndUp ? undefined : 12"
        >
          <UserChip :user-id="currentUser.id" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { toRefs } from "vue"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useCurrentUser from "@/use/use-current-user"
import useMyTravelRequestWizardSummary from "@/use/wizards/use-my-travel-request-wizard-summary"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import UserChip from "@/components/users/UserChip.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import TravelPurposeChip from "@/components/travel-purposes/TravelPurposeChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)

const { travelPurposeId, finalDestinationLocationId, departureDate, returnDate, refresh } =
  useMyTravelRequestWizardSummary(travelAuthorizationId)

const { currentUser } = useCurrentUser()
const { mdAndUp } = useVuetify2()

defineExpose({
  refresh,
})
</script>
