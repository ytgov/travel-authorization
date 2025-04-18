<template>
  <!-- TODO: split component into table and selectable table so each layer is less complex -->
  <v-data-table
    v-model="selectedItems"
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="travelAuthorizationPreApprovalsWithRestrictedSelectability"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    :show-select="showSelect"
    :single-select="noRowsAreSelectable"
    v-bind="$attrs"
    v-on="$listeners"
    @item-selected="lockSelectabilityToSameDepartment"
    @toggle-select-all="selectAllOfSameDepartment"
  >
    <template #top="slotProps">
      <slot
        name="top"
        :selected-items="selectedItems"
        v-bind="slotProps"
      ></slot>
    </template>

    <template #item.name="{ item }">
      <VTravelAuthorizationPreApprovalProfilesChip :travel-authorization-pre-approval="item" />
    </template>

    <template #item.travelDate="{ item }">
      <div v-if="item.isOpenForAnyDate">
        {{ item.month }}
      </div>
      <div v-else>
        <div>
          {{ formatDate(item.startDate) }}
          to
        </div>
        <div>
          {{ formatDate(item.endDate) }}
        </div>
      </div>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        v-if="canEdit(item)"
        color="secondary"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalEditPage',
          params: {
            travelAuthorizationPreApprovalId: item.id,
          },
        }"
      >
        Edit
      </v-btn>
      <v-btn
        v-else
        color="secondary"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalPage',
          params: {
            travelAuthorizationPreApprovalId: item.id,
          },
        }"
      >
        View
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizationPreApprovals, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/use/use-travel-authorization-pre-approvals"

import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"

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
  showSelect: {
    type: Boolean,
    default: true,
  },
})

const headers = [
  {
    text: "Name",
    value: "name",
    sortable: false,
    cellClass: "max-w-64",
  },
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Travel Date",
    value: "travelDate",
    sortable: false,
  },
  {
    text: "Location",
    value: "location",
  },
  {
    text: "Purpose Type",
    value: "purpose",
  },
  {
    text: "Reason",
    value: "reason",
    sortable: false,
  },
  {
    text: "Status",
    value: "status",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationPreApprovalsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelAuthorizationPreApprovals, isLoading, totalCount, refresh } =
  useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

const { currentUser, isAdmin, isPreApprovedTravelAdmin } = useCurrentUser()

function canEdit(travelAuthorizationPreApproval) {
  if (travelAuthorizationPreApproval.status !== TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) {
    return false
  }

  if (isAdmin.value) return true
  if (
    isPreApprovedTravelAdmin.value &&
    travelAuthorizationPreApproval.department === currentUser.value.department
  ) {
    return true
  }

  return travelAuthorizationPreApproval.creatorId === currentUser.value.id
}

const selectedItems = ref([])
const departmentSelectionLimiter = ref(null)

const travelAuthorizationPreApprovalsWithRestrictedSelectability = computed(() => {
  return travelAuthorizationPreApprovals.value.map((travelAuthorizationPreApproval) => {
    const isSelectable =
      travelAuthorizationPreApproval.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT &&
      (travelAuthorizationPreApproval.department === departmentSelectionLimiter.value ||
        isNil(departmentSelectionLimiter.value))

    return {
      ...travelAuthorizationPreApproval,
      isSelectable,
    }
  })
})

const noRowsAreSelectable = computed(
  () =>
    !travelAuthorizationPreApprovalsWithRestrictedSelectability.value.some(
      (travelAuthorizationPreApproval) => travelAuthorizationPreApproval.isSelectable
    )
)

async function lockSelectabilityToSameDepartment({
  item: travelAuthorizationPreApproval,
  value: isSelected,
}) {
  if (isSelected) {
    departmentSelectionLimiter.value = travelAuthorizationPreApproval.department
  } else {
    departmentSelectionLimiter.value = null
  }
}

async function selectAllOfSameDepartment({ items, value: isSelected }) {
  if (isSelected && departmentSelectionLimiter.value) {
    selectedItems.value = items.filter(
      (travelAuthorizationPreApproval) =>
        travelAuthorizationPreApproval.isSelectable &&
        travelAuthorizationPreApproval.department === departmentSelectionLimiter.value
    )
  } else if (isSelected && !isEmpty(items)) {
    const firstSelectableTravelAuthorizationPreApproval = items.find(
      (travelAuthorizationPreApproval) => travelAuthorizationPreApproval.isSelectable
    )
    departmentSelectionLimiter.value = firstSelectableTravelAuthorizationPreApproval.department
    selectedItems.value = items.filter(
      (travelAuthorizationPreApproval) =>
        travelAuthorizationPreApproval.isSelectable &&
        travelAuthorizationPreApproval.department === departmentSelectionLimiter.value
    )
  } else {
    selectedItems.value = []
    departmentSelectionLimiter.value = null
  }
}

defineExpose({
  refresh,
})
</script>

<style scoped>
/* https://tailwindcss.com/docs/max-width#basic-example */
:deep(.max-w-64) {
  --spacing: 0.25rem;
  max-width: calc(var(--spacing) * 64);
}
</style>
