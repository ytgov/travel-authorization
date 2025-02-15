import { reactive, toRefs, unref, watch } from "vue"

import expensesApi, { TYPES, EXPENSE_TYPES } from "@/api/expenses-api"

export { TYPES, EXPENSE_TYPES }

/**
 * TODO: add other fields
 * @typedef {Object} Expense
 * @property {number} id
 */

/**
 * Fetches and manages expenses data based on the provided options.
 *
 * @param {import('vue').Ref<{
 *   where: { [key: string]: any },
 *   page: number,
 *   perPage: number,
 * }>} [options={}] - The configuration options for fetching expenses, wrapped in a Vue ref.
 * @returns {{
 *   expenses: import('vue').Ref<Expense[]>,
 *   isLoading: import('vue').Ref<boolean>,
 *   isErrored: import('vue').Ref<boolean>,
 *   fetch: () => Promise<Expense[]>,
 * }}
 */
export function useExpenses(options = {}) {
  const state = reactive({
    expenses: [],
    isLoading: false,
    isErrored: false,
  })

  async function fetch() {
    state.isLoading = true
    try {
      const { expenses } = await expensesApi.list(unref(options))
      state.isErrored = false
      state.expenses = expenses
      return expenses
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(options),
    async () => {
      await fetch()
    },
    {
      immediate: true,
      deep: true,
    }
  )

  return {
    TYPES,
    EXPENSE_TYPES,
    ...toRefs(state),
    fetch,
    refresh: fetch,
  }
}

export default useExpenses
