import { reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorization-pre-approval-profiles-api.js').TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */

/**
 * @callback UseTravelAuthorizationPreApprovalProfile
 * @param {Ref<number>} id
 * @returns {{
 *   travelAuthorizationPreApprovalProfile: Ref<TravelAuthorizationPreApprovalProfile | null | undefined>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   fetch: () => Promise<TravelAuthorizationPreApprovalProfile>,
 *   refresh: () => Promise<TravelAuthorizationPreApprovalProfile>,
 * }}
 */

/** @type {UseTravelAuthorizationPreApprovalProfile} */
export function useTravelAuthorizationPreApprovalProfile(id) {
  const state = reactive({
    travelAuthorizationPreApprovalProfile: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { travelAuthorizationPreApprovalProfile } =
        await travelAuthorizationPreApprovalProfilesApi.get(unref(id))
      state.isErrored = false
      state.travelAuthorizationPreApprovalProfile = travelAuthorizationPreApprovalProfile
      return travelAuthorizationPreApprovalProfile
    } catch (error) {
      console.error("Failed to fetch travel authorization pre-approval profile:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(id),
    async (newId) => {
      if (isNil(newId)) return

      await fetch()
    },
    {
      immediate: true,
    }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useTravelAuthorizationPreApprovalProfile