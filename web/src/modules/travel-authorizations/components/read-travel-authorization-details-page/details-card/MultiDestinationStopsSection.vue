<template>
  <div>
    <v-row>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop1.locationId"
          label="From"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop2.locationId"
          label="To"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop1.departureDate"
          label="Date"
          prepend-icon="mdi-calendar"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop1.departureTime"
          label="Time"
          prepend-icon="mdi-clock"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          :value="stop1.transport"
          label="Travel Method"
          dense
          persistent-hint
          outlined
          readonly
        />
        <v-text-field
          :value="stop1.accommodationType"
          label="Type of Accommodation"
          dense
          outlined
          readonly
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop2.locationId"
          label="To"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop3.locationId"
          label="From"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop2.departureDate"
          label="Date"
          prepend-icon="mdi-calendar"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop2.departureTime"
          label="Time (24h)"
          prepend-icon="mdi-clock"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          :value="stop2.transport"
          label="Travel Method"
          dense
          persistent-hint
          outlined
          readonly
        />
        <v-text-field
          :value="stop2.accommodationType"
          label="Type of Accommodation"
          dense
          outlined
          readonly
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop3.locationId"
          label="From"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <VReadonlyLocationTextField
          :value="stop4.locationId"
          label="To"
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop3.departureDate"
          text="Date"
          prepend-icon="mdi-calendar"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <v-text-field
          :value="stop3.departureTime"
          label="Time (24h)"
          prepend-icon="mdi-clock"
          dense
          outlined
          persistent-hint
          readonly
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          :value="stop3.transport"
          label="Travel Method"
          dense
          persistent-hint
          outlined
          readonly
        />
        <v-text-field
          :value="stop3.accommodationType"
          label="Type of Accommodation"
          dense
          outlined
          readonly
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex"

import VReadonlyLocationTextField from "@/components/VReadonlyLocationTextField"

export default {
  name: "MultiDestinationStopsSection",
  components: {
    VReadonlyLocationTextField,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      stop1: {},
      stop2: {},
      stop3: {},
      stop4: {},
    }
  },
  computed: {
    ...mapGetters("travelAuthorization", {
      travelAuthorization: "attributes",
    }),
  },
  async mounted() {
    await this.ensureTravelAuthorization(this.travelAuthorizationId)

    this.stop1 = this.travelAuthorization.stops[0]
    this.stop2 = this.travelAuthorization.stops[1]
    this.stop3 = this.travelAuthorization.stops[2]
    this.stop4 = this.travelAuthorization.stops[3]
  },
  methods: {
    ...mapActions("travelAuthorization", {
      ensureTravelAuthorization: "ensure",
    }),
  },
}
</script>
