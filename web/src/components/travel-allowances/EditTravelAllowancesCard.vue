<template>
  <v-card>
    <v-card-title>
      <h3>Travel Allowances</h3>
    </v-card-title>

    <v-data-table
      :page.sync="page"
      :items-per-page.sync="perPage"
      :headers="headers"
      :items="travelAllowances"
      :loading="isLoading"
      :server-items-length="totalCount"
      @dblclick:row="(_, { item }) => showEditDialog(item)"
    >
      <template #top>
        <EditTravelAllowanceDialog
          ref="editTravelAllowanceDialog"
          @saved="refresh"
        />
      </template>
      <template #item.allowanceType="{ value }">
        {{ t(`travel_allowance.allowance_type.${value}`, { $default: value }) }}
      </template>
      <template #item.amount="{ item, value }">
        {{ formatCurrency(value, item.currency) }}
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end">
          <v-btn
            title="Edit"
            icon
            color="blue"
            @click="showEditDialog(item)"
            ><v-icon>mdi-pencil</v-icon></v-btn
          >
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import formatCurrency from "@/utils/format-currency"
import useRouteQuery from "@/use/utils/use-route-query"
import useTravelAllowances from "@/use/use-travel-allowances"

import EditTravelAllowanceDialog from "@/components/travel-allowances/EditTravelAllowanceDialog.vue"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */

const { t } = useI18n()

const headers = ref([
  {
    text: "Allowance Type",
    value: "allowanceType",
  },
  {
    text: "Amount",
    value: "amount",
  },
  {
    text: "",
    value: "actions",
  },
])

const page = useRouteQuery("travelAllowancesPage", "1", { transform: parseInt })
const perPage = useRouteQuery("travelAllowancesPerPage", "5", { transform: parseInt })

const travelAllowancesQuery = computed(() => ({
  page: page.value,
  perPage: perPage.value,
}))
const { travelAllowances, totalCount, isLoading, refresh } =
  useTravelAllowances(travelAllowancesQuery)

/** @type {Ref<InstanceType<typeof EditTravelAllowanceDialog> | null>} */
const editTravelAllowanceDialog = ref(null)

function showEditDialog(perDiem) {
  editTravelAllowanceDialog.value?.show(perDiem)
}
</script>

<style scoped></style>
