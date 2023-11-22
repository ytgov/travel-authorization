import { isString, pick } from "lodash"

import { FORM_URL, LOOKUP_URL } from "@/urls"
import { secureGet, securePost } from "@/store/jwt"

import expensesApi from "@/api/expenses-api"
import travelAuthorizationsApi from "@/api/travel-authorizations-api"

const state = {
  departments: [],
  emails: [],
  estimates: [],
  currentTravelAuthorization: {
    expenses: [],
    purpose: {},
    stops: [],
  },
  loadingCurrentForm: true,
  loadingEstimates: true,
}

// Shim to support refering to form as request for legacy code
state.request = state.currentTravelAuthorization

const getters = {
  currentTravelAuthorizationId(state) {
    return state.currentTravelAuthorization.id
  },
  currentTravelAuthorizationEstimates(state) {
    return (
      state.currentTravelAuthorization.expenses?.filter(
        (expense) => expense.type === expensesApi.TYPES.ESTIMATE
      ) || []
    )
  },
}

const actions = {
  async initialize(store) {
    await store.dispatch("loadDepartments")
  },
  async emailSearch({ commit }, token) {
    if (isString(token) && token.length >= 3) {
      const { data: emails } = await secureGet(`${LOOKUP_URL}/emailList?email=${token}`)
      commit("SET_EMAILS", emails)
    } else {
      commit("SET_EMAILS", [])
    }
    return this.emails
  },
  async loadDepartments({ commit }) {
    return secureGet(`${LOOKUP_URL}/departmentList2`).then((resp) => {
      commit("SET_DEPARTMENTS", resp.data.data)
      return resp.data.data
    })
  },
  loadEstimates({ commit, state }, { travelAuthorizationId }) {
    state.loadingEstimates = true
    return expensesApi
      .list({ where: { travelAuthorizationId, type: expensesApi.TYPES.ESTIMATE } })
      .then(({ expenses: estimates }) => {
        commit("SET_ESTIMATES", estimates)
        return estimates
      })
      .finally(() => {
        state.loadingEstimates = false
      })
  },
  loadCurrentTravelAuthorization({ state, dispatch }, formId) {
    state.loadingCurrentForm = true
    return dispatch("loadCurrentTravelAuthorizationSilently", formId).finally(() => {
      state.loadingCurrentForm = false
    })
  },
  async loadCurrentTravelAuthorizationSilently({ commit, dispatch }, formId) {
    const currentUser = await dispatch("currentUser/initialize", null, { root: true })

    return travelAuthorizationsApi.get(formId).then(({ travelAuthorization: form }) => {
      commit("SET_FORM", {
        ...form,
        ...pick(currentUser, [
          "firstName",
          "lastName",
          "email",
          "department",
          "division",
          "branch",
          "unit",
          "mailcode",
        ]),
      })
      commit("SET_FORM", form)
      return form
    })
  },
  create({ commit, state }, attributes) {
    state.loadingCurrentForm = true
    return travelAuthorizationsApi
      .create(attributes)
      .then(({ travelAuthorization: form }) => {
        commit("SET_FORM", form)
        return form
      })
      .finally(() => {
        state.loadingCurrentForm = false
      })
  },
  updateCurrentForm({ commit, state }) {
    const formId = state.currentTravelAuthorization.id
    const attributes = state.currentTravelAuthorization
    state.loadingCurrentForm = true
    return travelAuthorizationsApi
      .update(formId, attributes)
      .then(({ travelAuthorization: form }) => {
        commit("SET_FORM", form)
        return form
      })
      .finally(() => {
        state.loadingCurrentForm = false
      })
  },
  update({ dispatch }) {
    console.warn("Deprecated: use updateCurrentForm instead.")
    return dispatch("updateCurrentForm")
  },
  delete(store, { id }) {
    return securePost(`${FORM_URL}/${id}`).then((resp) => {
      return resp.data
    })
  },
}

const mutations = {
  SET_EMAILS(store, value) {
    store.emails = value
  },
  SET_FORM(store, value) {
    store.currentTravelAuthorization = value
    // propagates to store.request object, for legacy code
    store.request = store.currentTravelAuthorization
  },
  SET_DEPARTMENTS(store, value) {
    store.departments = value
  },
  SET_ESTIMATES(store, value) {
    store.estimates = value
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}