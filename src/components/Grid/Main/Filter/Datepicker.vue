<template>
  <v-date-picker mode="dateTime" v-model="dateRange" locale="et" :is24hr="true" is-range timezone="UTC">
    <template v-slot="{ inputValue, inputEvents }">
      <div class="flex justify-center items-center">
        <input
            :value="inputValue.start"
            v-on="inputEvents.start"
            class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
        />
        <svg
            class="w-4 h-4 mx-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="20"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
        <input
            :value="inputValue.end"
            v-on="inputEvents.end"
            class="border px-2 py-1 w-32 rounded focus:outline-none focus:border-indigo-300"
        />
      </div>
    </template>
  </v-date-picker>
</template>


<script>
import {mapActions, mapGetters} from "vuex";

export default {
  name: "Datepicker",
  props: {
    refresh: {}
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'filterQuery',
    ]),
    dateRange: {
      get() {
        return {
          start: this.filterQuery.from ? new Date(this.filterQuery.from) : null,
          end: this.filterQuery.to ? new Date(this.filterQuery.to) : null,
        }
      },
      set(value) {
        if (value) {
          let toDate = new Date(value.end);
          toDate.setSeconds(59, 999);
          this.setFilterQueryTimeRange({
            from: (new Date(value.start).getTime()),
            to: (toDate.getTime()),
          })
          this.refresh()
        }
      }
    }
  },
  methods: {
    ...mapActions({
      setFilterQueryTimeRange: 'setFilterQueryTimeRange',
    }),
  }
}
</script>

<style scoped>

</style>