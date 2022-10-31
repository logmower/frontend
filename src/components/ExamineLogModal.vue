<template>
  <v-dialog
      v-model="examineLog"
      width="50wv"
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
        ></ag-grid-vue>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" block @click="closeModal">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles//ag-grid.css";
import "ag-grid-community/styles//ag-theme-material.css";
import ScreenshotCell from "./ScreenshotCell.js";
import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
import { VDialog } from 'vuetify/components/VDialog'
import { VBtn } from 'vuetify/components/VBtn'
import { VTable } from 'vuetify/components/VTable'


export default {
  components: {
    AgGridVue,
    VCard,
    VCardText,
    VCardActions,
    VBtn,
    VDialog,
    VTable,
    ScreenshotCell: ScreenshotCell
  },
  data() {
    return {
      columnDefs:  [
        {
          field: 'key',
          sortable: true,
          filter: 'agTextColumnFilter',
          resizable: true
        },
        {
          field: 'value',
          sortable: true,
          filter: 'agTextColumnFilter',
          resizable: true
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
  }
}

</script>