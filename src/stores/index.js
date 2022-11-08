import { createStore } from "vuex"

const store = createStore({
  state: {
    filterOptions: {},
    filterQuery: {},
  },
  getters: {
    streaming (state) {
      return state.filterQuery['streaming'] ?? false
    },
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
    toggleFilterQueryStreaming(context) {
      context.commit("TOGGLE_FILTER_QUERY_STREAMING");
    },
  },
  mutations: {
    SET_FILTER_OPTIONS(state, payload) {
      state.filterOptions = payload
    },
    SET_FILTER_QUERY(state, payload) {
      let query = payload
      if (Object.keys(state.filterOptions).length) {
        query['initial'] = false
      }
      state.filterQuery = query
    },
    TOGGLE_FILTER_QUERY_STREAMING(state) {
      let query = state.filterQuery
      query['streaming'] = (query['streaming'] === undefined) ? false : query['streaming']
      query['streaming'] = !(query['streaming'])
      query['initial'] = false
      state.filterQuery = query
    },
  },
});

export default store