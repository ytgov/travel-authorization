<template>
  <div class="mt-4">
    <div class="d-flex justify-end">
      <EstimateCreateDialog
        v-if="hasEstimates"
        :travel-authorization-id="travelAuthorizationId"
        @created="refreshEstimates"
      />
      <EstimateGenerateDialog
        v-else
        :travel-authorization-id="travelAuthorizationId"
        @created="refreshEstimates"
      />
    </div>

    <EstimatesTable
      ref="estimatesTable"
      :travel-authorization-id="travelAuthorizationId"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex"

import { TYPES } from "@/api/expenses-api"

import EstimateCreateDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-estimate-page/EstimateCreateDialog"
import EstimateGenerateDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-estimate-page/EstimateGenerateDialog"
import EstimatesTable from "@/modules/travel-authorizations/components/edit-my-travel-authorization-estimate-page/EstimatesTable"

export default {
  name: "EditMyTravelAuthorizationEstimatePage",
  components: {
    EstimateCreateDialog,
    EstimateGenerateDialog,
    EstimatesTable,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data: () => ({}),
  computed: {
    ...mapGetters("expenses", ["items", "isLoading"]),
    hasEstimates() {
      return this.isLoading === false && this.items.length > 0
    },
  },
  async mounted() {
    await this.ensure({
      where: {
        travelAuthorizationId: this.travelAuthorizationId,
        type: TYPES.ESTIMATE,
      },
    })
  },
  methods: {
    ...mapActions("expenses", ["ensure"]),
    refreshEstimates() {
      this.$refs.estimatesTable.refresh()
    },
  },
}
</script>
