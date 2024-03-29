import { computed, reactive, toRefs } from "vue"

import { sleep } from "@/utils/sleep"

import usersApi, { ROLES } from "@/api/users-api"

// Note that state is global here
const state = reactive({
  currentUser: {
    roles: [],
  },
  isLoading: false,
  isErrored: false,
  isCached: false,
})

/**
 * This stores the global current user state.
 * Immediately ensures current user
 *
 * @params {{ eager: boolean }} [options={}]
 * @param {boolean} [options.eager=true] - Indicates whether to fetch the current user immediately.
 * @returns {{
 *   ROLES: typeof ROLES,
 *   currentUser: import('vue').Ref<User>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   isCached: import('vue').Ref<boolean>,
 *   isReady: import('vue').Ref<boolean>,
 *   id: import('vue').Ref<number>,
 *   fullName: import('vue').Ref<string>,
 *   isAdmin: import('vue').Ref<boolean>,
 *   ensure: () => Promise<User>,
 *   fetch: () => Promise<User>,
 *   unset: () => void,
 * }}
 */
export function useCurrentUser({ eager = true } = {}) {
  const isReady = computed(() => state.isCached && !state.isLoading && !state.isErrored)
  const id = computed(() => state.currentUser.id)
  const fullName = computed(() => {
    const { firstName, lastName } = state.currentUser
    return [firstName, lastName].filter(Boolean).join(" ")
  })
  const isAdmin = computed(() => state.currentUser.roles?.includes(ROLES.ADMIN))

  if (eager) {
    ensure() // Normally would go inside a "watch" but this doesn't have any params to watch
  }

  async function ensure() {
    while (state.isLoading) {
      await sleep(75)
    }

    if (state.isErrored) {
      console.error("User store has errored, returning {}.")
      return {}
    }

    if (state.isCached) return state.currentUser

    return fetch()
  }

  async function fetch() {
    state.isLoading = true
    try {
      const { user } = await usersApi.me()
      state.isErrored = false
      state.currentUser = user
      state.isCached = true
      return user
    } catch (error) {
      console.error("Failed to fetch travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  function unset() {
    state.currentUser = {
      roles: [],
    }
    state.isLoading = false
    state.isErrored = false
    state.isCached = false
  }

  return {
    ROLES,
    // getters
    ...toRefs(state),
    isReady,
    id,
    fullName,
    isAdmin,
    // actions
    ensure,
    fetch,
    unset,
  }
}

export default useCurrentUser
