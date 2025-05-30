<template>
  <HeaderActionsFormCard
    title="Traveller Details"
    header-tag="h3"
    @submit.prevent="addTravelerProfileAttributes"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <v-switch
          :input-value="exactTravelerKnown"
          :label="exactTravelerKnown ? 'Exact traveler known' : 'Exact traveler not known'"
          inset
          @change="toggleExactTravelerKnown"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-if="exactTravelerKnown"
        cols="12"
        md="4"
      >
        <YgEmployeeAutocomplete
          v-model="travelerName"
          item-value="fullName"
          item-text="fullName"
          label="Traveler name *"
          hint="Search for a traveler. If no travelers are found, try a different department or branch."
          outlined
          :where="ygEmployeeWhere"
          :filters="ygEmployeeFilters"
        />
      </v-col>
      <v-col
        v-else
        cols="12"
        md="4"
      >
        <v-text-field
          v-model.number="numberTravelersLocal"
          label="Number of Travelers *"
          type="number"
          outlined
          persistent-hint
          :disabled="profileAlreadyCreated"
          @input="emit('update:numberTravelers', Number($event))"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-btn
          color="primary"
          :disabled="isNil(travelerName) && isNil(numberTravelersLocal)"
          @click="addTravelerProfileAttributes"
        >
          Add traveler profile
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="9"
      >
        <v-data-table
          :headers="headers"
          :items="value"
          hide-default-footer
        >
          <template #item.actions="{ index }">
            <v-btn
              title="Remove traveler profile"
              icon
              color="error"
              @click="removeTravelerProfileAttributes(index)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"

/** @typedef {import("@/api/travel-authorization-pre-approvals-api").TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */

const props = defineProps({
  department: {
    type: String,
    required: true,
  },
  value: {
    /**
     * @type {Partial<TravelAuthorizationPreApprovalProfile>[]}
     */
    type: Array,
    default: () => [],
  },
  numberTravelers: {
    type: Number,
    default: undefined,
  },
  isOpenForAnyTraveler: {
    type: Boolean,
    default: false,
  },
  branch: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(["input", "update:numberTravelers", "update:isOpenForAnyTraveler"])

const exactTravelerKnown = ref(true)
const travelerName = ref(undefined)
const numberTravelersLocal = ref(undefined)

const ygEmployeeWhere = computed(() => ({
  department: props.department,
  branch: props.branch,
}))
const ygEmployeeFilters = computed(() => {
  if (isEmpty(props.value)) return {}

  const fullNamesToExclude = props.value.map((profile) => profile.profileName)
  return {
    excludingByFullNames: fullNamesToExclude,
  }
})

const profileAlreadyCreated = computed(() => !isEmpty(props.value))

const headers = ref([
  {
    text: "Name",
    value: "profileName",
  },
  {
    text: "Dept.",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
])

function toggleExactTravelerKnown(value) {
  exactTravelerKnown.value = value
  travelerName.value = undefined
  numberTravelersLocal.value = undefined

  emit("update:isOpenForAnyTraveler", !exactTravelerKnown.value)
  emit("update:numberTravelers", numberTravelersLocal.value)
  emit("input", [])
}

function addTravelerProfileAttributes() {
  if (isNil(travelerName.value) && isNil(numberTravelersLocal.value)) {
    return
  }

  let newProfileAttributes

  if (exactTravelerKnown.value) {
    newProfileAttributes = {
      profileName: travelerName.value,
      department: props.department,
      branch: props.branch,
    }
  } else {
    const profilePrefix = [props.department, props.branch].filter(Boolean).join(" ")
    // TODO: consider if we should be adding one record for each "number of travelers"?
    // TODO: consider if we should be including the "number of travelers" in the profile name
    const profileName = `${profilePrefix} staff`
    newProfileAttributes = {
      profileName,
      department: props.department,
      branch: props.branch,
    }
  }

  emit("input", [...props.value, newProfileAttributes])
  travelerName.value = undefined
  numberTravelersLocal.value = undefined
}

function removeTravelerProfileAttributes(index) {
  const travelerProfilesAttributesWithoutItem = [
    ...props.value.slice(0, index),
    ...props.value.slice(index + 1),
  ]
  emit("input", travelerProfilesAttributesWithoutItem)
}
</script>
