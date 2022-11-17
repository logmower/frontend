import { createStore } from "vuex"

const store = createStore({
  state: {
    filterOptions: {},
    filterQuery: {},
    lastPingReceived: null,
  },
  getters: {
    streaming (state) {
      return state.filterQuery['streaming'] ?? false
    },
    filterQuery (state) {
      return state.filterQuery
    },
    lastPingReceived (state) {
      return state.lastPingReceived
    },
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
    setFilterQueryTimeRange({commit, state}, {from, to}) {
      let query = state.filterQuery
      query.from = from
      query.to = to
      query.streaming = false
      commit("SET_FILTER_QUERY", query);
    },
    setLastPingReceived(context) {
      context.commit("SET_LAST_PING_RECEIVED");
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
      let streaming = (query['streaming'] === undefined) ? false : query['streaming']
      query['streaming'] = !(streaming)
      query['initial'] = false

      if (!streaming) {
        delete query['from']
        delete query['to']
      }

      state.filterQuery = query
    },
    SET_LAST_PING_RECEIVED(state) {
      state.lastPingReceived = (new Date()).getTime()
    }
  },
});

export default store