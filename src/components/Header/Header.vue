<template>
  <v-row no-gutters>
    <v-col cols="12" sm="5" class="d-flex justify-start flex-wrap" >
      <Datepicker class="ma-2" :refresh="refreshFilterState" />
    </v-col>
    <v-col cols="12" sm="2" class="d-flex justify-center flex-wrap">
      <h1 class="app-title"> {{ title }} </h1>
    </v-col>
    <v-col cols="12" sm="5" class="d-flex justify-end flex-wrap align-center">
      <ConnectionMonitor @setup-stream="setupStream" />
      <v-btn
          color="blue-grey"
          class="ma-2"
          :prepend-icon="streaming ? 'mdi-pause' :'mdi-play'"
          @click="toggleFilterQueryStreaming"
      >
        Stream new lines
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
import { VRow, VCol } from 'vuetify/components/VGrid'
import { VBtn } from 'vuetify/components/VBtn'
import Datepicker from "../Grid/Main/Filter/Datepicker.vue";
import {mapActions, mapGetters} from "vuex";
import ConnectionMonitor from "./ConnectionMonitor.vue";

export default {
  components: {
    ConnectionMonitor,
    Datepicker,
    VRow,
    VCol,
    VBtn
  },
  props: {
    refreshFilterState: Function,
    title: String
  },
  computed: {
    ...mapGetters([
      'streaming'
    ]),
  },
  methods: {
    ...mapActions({
      toggleFilterQueryStreaming: 'toggleFilterQueryStreaming',
    }),
    setupStream () {
      this.$emit('setupStream')
    }
  }
}
</script>

<style scoped>

</style>
