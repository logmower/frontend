<template>
  <v-select
      v-model="filterValue"
      :options="options"
      :placeholder="placeholder"
      @open="updateOptions"
  ></v-select>
</template>

<script>
import vSelect from "vue-select"

export default {
  name: "Combobox",
  components: {
    vSelect
  },
  props: {
    field: {
    },
    changeValue: {
    },
    filter: {
    },
    placeholder: {
    },
  },
  data() {
    return {
      options: []
    }
  },
  computed: {
    filterValue: {
      get() {
        return this.filter
      },
      set(newValue) {
        this.changeValue(newValue)
      }
    }
  },
  methods: {
    updateOptions() {
      this.options = this.$store.state.filterOptions[this.field] ?? []
    }
  }
}
</script>

<style scoped>

</style>