import { createStore } from "vuex"

const store = createStore({
  state: {
    filterOptions: {},
    filterQuery: {}
  },
  getters: {
    filterQuery (state) {
      return state.filterQuery
    }
  },
  actions: {
    setFilterOptions(context, payload) {
      context.commit("SET_FILTER_OPTIONS", payload);
    },
    setFilterQuery(context, payload) {
      context.commit("SET_FILTER_QUERY", payload);
    },
  },
  mutations: {
    SET_FILTER_OPTIONS(state, payload) {
      state.filterOptions = payload
    },
    SET_FILTER_QUERY(state, payload) {
      state.filterQuery = payload
    },
  },
});

export default store