<template>
  <v-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-per-page.sync="perPage"
    :page.sync="page"
    :server-items-length="totalCount"
    class="elevation-2"
    v-on="$listeners"
    @click:row="goToManageTravelAuthorization"
  >
    <template #item.name="{ item }">
      <span>{{ item.firstName }} {{ item.lastName }}</span>
    </template>
    <template #item.purposeText="{ value }">
      <span>{{ value }}</span>
    </template>
    <template #item.finalDestination="{ value }">
      <span>{{ formatFinalDestination(value) }}</span>
    </template>
    <template #item.departingAt="{ value }">
      <span>{{ formatDate(value) }}</span>
    </template>
    <template #item.returningAt="{ value }">
      <span>{{ formatDate(value) }}</span>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue2-helpers/vue-router"

import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizations from "@/use/use-travel-authorizations"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
})

const headers = ref([
  {
    text: "TA #",
    value: "id",
    sortable: false,
  },
  {
    text: "Requestee",
    value: "name",
    sortable: false,
  },
  {
    text: "Final Destination",
    value: "finalDestination",
    sortable: false,
  },
  {
    text: "Type",
    value: "purposeText",
    sortable: false,
  },
  {
    text: "Departure Date",
    value: "departingAt",
    sortable: false,
  },
  {
    text: "Return Date",
    value: "returningAt",
    sortable: false,
  },
])

const page = useRouteQuery(`page${props.routeQuerySuffix}`, 1, {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, 10, {
  transform: integerTransformer,
})

const { currentUser } = useCurrentUser()

const travelAuthorizationsQuery = computed(() => {
  return {
    where: {
      ...props.where,
      supervisorEmail: currentUser.value.email,
    },
    filters: props.filters,
    page: page.value,
    perPage: perPage.value,
  }
})
const { travelAuthorizations, totalCount, isLoading, refresh } =
  useTravelAuthorizations(travelAuthorizationsQuery)

function formatFinalDestination(value) {
  if (isNil(value)) return ""

  const { city, province } = value
  return `${city} (${province})`
}

const router = useRouter()

function goToManageTravelAuthorization(travelAuthorization) {
  const travelAuthorizationId = travelAuthorization.id
  router.push({
    name: "manage-travel-requests/ManageTravelRequestDetailsPage",
    params: {
      travelAuthorizationId,
    },
  })
}

defineExpose({
  refresh,
})
</script>
