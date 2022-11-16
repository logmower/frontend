<template>
  <v-dialog
      v-model="examineLog"
      width="50wv"
      @click.outside="close"
      transition="false"
  >
    <v-card>
      <v-card-text style="height: 70vh">
        <ag-grid-vue
            style="width: 100%; height: 100%;"
            class="ag-theme-material"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :row-data="examineLogContent"
            :supress-horisontal-scroll="true"
            :enable-scrolling="true"
            :enableCellTextSelection="true"
            :ensureDomOrder="true"
            @cell-clicked="copyText"
          ></ag-grid-vue>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="closeModal" transition="false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles//ag-grid.css";
import "ag-grid-community/styles//ag-theme-material.css";
import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
import { VDialog } from 'vuetify/components/VDialog'
import { VBtn } from 'vuetify/components/VBtn'
import { VTable } from 'vuetify/components/VTable'
import ValueRenderer from "./ValueRenderer";

export default {
  name: "ExamineLogModal",
  components: {
    AgGridVue,
    VCard,
    VCardText,
    VCardActions,
    VBtn,
    VDialog,
    VTable,
    ValueRenderer
  },
  data() {
    return {
      columnDefs:  [
        {
          field: 'key',
          sortable: true,
          filter: 'agTextColumnFilter',
          resizable: true,
          width: 10,
        },
        {
          field: 'value',
          sortable: true,
          filter: 'agTextColumnFilter',
          resizable: true,
          cellRenderer: 'ValueRenderer'
        },
      ]
    }
  },
  props: {
    examineLogContent: Array,
    closeModal: Function
  },
  computed: {
    examineLog() {
      return !!this.examineLogContent
    }
  },
  methods: {
    onGridReady(params) {
      params.api.sizeColumnsToFit()
    },
    close (e) {
      if (e.target.className !== "ag-cell-value") {
        this.closeModal()
      }
    },
    copyText(e) {
      navigator.clipboard.writeText(e.value);
      this.$toast.success(`Value copied to clipboard`, {
        position: "top-right",
      });
      setTimeout(this.$toast.clear, 3000);
    }
  }
}

</script>