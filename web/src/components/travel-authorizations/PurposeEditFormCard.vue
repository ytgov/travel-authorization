<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="Purpose"
    lazy-validation
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelPurposeSelect
          v-model="travelAuthorization.purposeId"
          :rules="[required]"
          dense
          item-text="purpose"
          item-value="id"
          label="Purpose *"
          outlined
          required
          validate-on-blur
          @input="emit('update:travelPurposeId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        xl="6"
      >
        <v-text-field
          v-model="travelAuthorization.eventName"
          :rules="[required]"
          dense
          label="Name of meeting/conference, mission, trade fair or course *"
          outlined
          required
          validate-on-blur
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
        xl="2"
      >
        <!-- Depending on in territory flag we will load a different list of destinations -->
        <v-checkbox
          v-model="travelAuthorization.allTravelWithinTerritory"
          label="In Territory?"
          dense
        />
      </v-col>
      <v-col
        cols="12"
        md="9"
        lg="6"
        xl="4"
      >
        <LocationsAutocomplete
          :value="lastStop.locationId"
          :in-territory="travelAuthorization.allTravelWithinTerritory"
          :rules="[required]"
          clearable
          dense
          label="Final Destination *"
          outlined
          persistent-hint
          required
          validate-on-blur
          @input="updateLastStopLocationId"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Objectives</h3>
        <ul>
          <li>Purpose of attendance</li>
          <li>Relevance and anticipated benefits to branch and Government of Yukon</li>
        </ul>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="travelAuthorization.benefits"
          :rules="[required]"
          auto-grow
          dense
          label="Objectives *"
          outlined
          required
          rows="10"
          validate-on-blur
        />
      </v-col>
    </v-row>
  </HeaderActionsFormCard>
</template>

<script setup>
import { ref, toRefs } from "vue"

import { required } from "@/utils/validators"
import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["update:travelPurposeId", "update:finalDestinationLocationId"])

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, stops, lastStop, replaceStops, save } =
  useTravelAuthorization(travelAuthorizationId)

function updateLastStopLocationId(locationId) {
  replaceStops([
    ...stops.value.slice(0, -1),
    {
      ...lastStop.value,
      locationId,
    },
  ])
  emit("update:finalDestinationLocationId", locationId)
}

const headerActionsFormCard = ref(null)

defineExpose({
  save,
  validate: () => headerActionsFormCard.value?.validate(),
})
</script>
