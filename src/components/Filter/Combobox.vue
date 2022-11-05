<template>
  <v-select
      v-model="filter"
      :options="options"
      class="ag-custom-component-popup"
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
    options: {
    },
    changeValue: {
    }
  },
  data() {
    return {
      filter: null,
    }
  },
  watch: {
    filter(value) {
      this.changeValue(value)
    }
  }
}
</script>

<style scoped>

</style>