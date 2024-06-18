import { computed, reactive, toRefs, unref, watch } from "vue"

import { TYPES as EXPENSE_TYPES } from "@/api/expenses-api"
import travelAuthorizationsApi, { STATUSES } from "@/api/travel-authorizations-api"

export { STATUSES }

/**
 * TODO: add other fields
 * @typedef {Object} TravelAuthorization
 * @property {number} id
 * @property {number} userId
 * @property {Expense[]} expenses
 * @property {Purpose} purpose
 * @property {Stop[]} stops
 * @property {TravelSegment[]} travelSegments
 * @property {User} user
 */

/**
 * This stores a global user state per id.
 *
 * TODO: consider requiring the id, and building a separate function for use without an id
 *
 * @callback UseTravelAuthorization
 * @param {import('vue').Ref<number>} [travelAuthorizationId]
 * @returns {{
 *   travelAuthorization: import('vue').Ref<TravelAuthorization>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   stops: import('vue').Ref<Stop[]>,
 *   firstStop: import('vue').Ref<Stop>,
 *   lastStop: import('vue').Ref<Stop>,
 *   fetch: () => Promise<TravelAuthorization>,
 *   save: () => Promise<TravelAuthorization>, // save that triggers loading state
 *   saveSilently: () => Promise<TravelAuthorization>, // save that does not trigger loading state
 *   create: (attributes: Partial<TravelAuthorization>) => Promise<TravelAuthorization>,
 *   newBlankStop: (attributes: Partial<Stop>) => Stop,
 *   replaceStops: (stops: Stop[]) => Stop[],
 *   approve: () => Promise<TravelAuthorization>,
 *   deny: ({ denialReason: string } = {}) => Promise<TravelAuthorization>,
 *   expenseClaim: (attributes) => Promise<TravelAuthorization>,
 * }}
 */

/** @type {UseTravelAuthorization} */
export function useTravelAuthorization(travelAuthorizationId) {
  const state = reactive({
    travelAuthorization: {
      expenses: [],
      purpose: {},
      stops: [],
      travelSegments: [],
      user: {},
    },
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(params = {}) {
    state.isLoading = true
    try {
      const { travelAuthorization, policy } = await travelAuthorizationsApi.get(
        unref(travelAuthorizationId),
        params
      )
      state.policy = policy
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to fetch travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save() {
    state.isLoading = true
    try {
      return saveSilently()
    } finally {
      state.isLoading = false
    }
  }

  async function saveSilently() {
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.update(
        unref(travelAuthorizationId),
        state.travelAuthorization
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to update travel authorization:", error)
      state.isErrored = true
      throw error
    }
  }

  // TODO: consider having a different use function for creating a new travel authorization
  // e.g. buildTravelAuthorization() which returns { travelAuthorization, isLoading, isErrored, create }
  async function create(attributes) {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.create(attributes)
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to create travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  // Stateful actions
  async function submit() {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.submit(
        unref(travelAuthorizationId),
        state.travelAuthorization
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to update travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function approve() {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.approve(
        unref(travelAuthorizationId)
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to approve for travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function deny({ denialReason } = {}) {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.deny(
        unref(travelAuthorizationId),
        { denialReason }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to deny for travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function expenseClaim(attributes) {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.expenseClaim(
        unref(travelAuthorizationId),
        attributes
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to submit expense claim for travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelAuthorizationId),
    async (newTravelAuthorizationId) => {
      if ([undefined, null].includes(newTravelAuthorizationId)) return
      // TODO: add some tests and check whether I should abort on loading
      // to avoid infinite loops
      // if (state.isLoading === true) return

      await fetch()
    },
    { immediate: true }
  )

  const estimates = computed(() =>
    state.travelAuthorization.expenses?.filter((expense) => expense.type === EXPENSE_TYPES.ESTIMATE)
  )
  const stops = computed(() => state.travelAuthorization.stops)
  const firstStop = computed(() => stops.value[0] || {})
  const lastStop = computed(() => stops.value[stops.value.length - 1] || {})

  function newBlankStop(attributes) {
    return {
      travelAuthorizationId: state.travelAuthorization.id,
      ...attributes,
    }
  }

  // In the future it might make sense to directly update stops in the back-end
  function replaceStops(stops) {
    state.travelAuthorization = {
      ...state.travelAuthorization,
      stops,
    }

    return stops
  }

  return {
    STATUSES,
    ...toRefs(state),
    // computed attributes
    estimates,
    stops,
    firstStop,
    lastStop,
    // methods
    fetch,
    refresh: fetch,
    save,
    saveSilently,
    create,
    newBlankStop,
    replaceStops,
    // stateful action
    submit,
    approve,
    deny,
    expenseClaim,
  }
}

export default useTravelAuthorization
