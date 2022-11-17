<template>
  <v-tooltip :text="`Last ping from server received at ${secondsFromLastPing} seconds ago`" location="bottom">
    <template v-slot:activator="{ props }">
      <v-icon :color="(secondsFromLastPing > pingThreshold || secondsFromLastPing === null) ? 'red' : 'green'" v-bind="props" class="mr-6">mdi-server</v-icon>
    </template>
  </v-tooltip>
</template>

<script>
import { VTooltip } from 'vuetify/components/VTooltip'
import { VIcon } from 'vuetify/components/VIcon'
import {mapGetters} from "vuex";

export default {
  name: "ConnectionMonitor",
  components: {
    VTooltip,
    VIcon
  },
  data() {
    return {
      pingThreshold: 10,
      pingError: false,
      secondsFromLastPing: null,
      setupStreamInterval: null,
    }
  },
  computed: {
    ...mapGetters([
      'lastPingReceived'
    ])
  },
  mounted() {
    // window.setInterval(() => {
    //   this.monitorServerConnection()
    // }, 10000)
    window.setInterval(() => {
      this.secondsFromLastPing = Math.floor(((new Date()).getTime() - this.lastPingReceived) / 1000)
      this.pingError = this.secondsFromLastPing > this.pingThreshold
    }, 1000)
  },
  watch: {
    pingError(error) {
      if (error) {
        this.$toast.error(`Connection with server lost, attempting to reconnect...`, {
          position: "top-right",
          duration: false,
        });
        this.setupStreamInterval = window.setInterval(() => {
          this.$emit('setupStream')
        }, 3000)
      } else {
        window.clearTimeout(this.setupStreamInterval);
        this.$toast.clear();
        this.$toast.success(`Connection with server reestablished`, {
          position: "top-right",
        });
      }
    },
  },
  methods: {
    monitorServerConnection () {
      if (this.secondsFromLastPing > this.pingThreshold) {
        this.pingError = true;
        this.$toast.error(`Connection with server lost, attempting to reconnect...`, {
          position: "top-right",
        });
        this.setupStream();
      } else {
        if (this.pingError) {
          this.$toast.success(`Connection with server reestablished`, {
            position: "top-right",
          });
          setTimeout(this.$toast.clear, 3000);
        }
        this.pingError = false;
      }
    }
  }
}
</script>

<style scoped>

</style>