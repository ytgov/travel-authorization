<template>
  <v-form
    ref="form"
    class="mt-4"
    lazy-validation
  >
    <v-row>
      <v-col>
        <PurposeFormCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DetailsFormCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsFormCard
          :travel-authorization-id="travelAuthorizationId"
          :validate-form="validateForm"
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-end">
      <SaveDraftButton
        :travel-authorization-id="travelAuthorizationId"
        :validate-form="validateForm"
      />
      <v-btn
        class="ml-3"
        color="secondary"
        :to="{ name: 'MyTravelAuthorizationsPage' }"
        >Back</v-btn
      >
    </div>
  </v-form>
</template>

<script>
import PurposeFormCard from "@/modules/travel-authorizations/components/edit-my-travel-authorization-details-page/PurposeFormCard"
import DetailsFormCard from "@/modules/travel-authorizations/components/edit-my-travel-authorization-details-page/DetailsFormCard"
import ApprovalsFormCard from "@/modules/travel-authorizations/components/edit-my-travel-authorization-details-page/ApprovalsFormCard"

import SaveDraftButton from "@/modules/travel-authorizations/components/edit-my-travel-authorization-details-page/SaveDraftButton"

export default {
  name: "EditMyTravelAuthorizationDetailsPage",
  components: {
    PurposeFormCard,
    DetailsFormCard,
    ApprovalsFormCard,
    SaveDraftButton,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    validateForm() {
      if (this.$refs.form.validate()) return true

      return false
    },
  },
}
</script>
