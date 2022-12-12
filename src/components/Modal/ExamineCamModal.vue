<template>
  <v-dialog
      v-model="examineLog"
      width="50wv"
      @click.outside="close"
      transition="false"
  >
    <v-card>
      <v-card-text :style="{ height: gridHeight + 'px' }">
        <ag-grid-vue
            v-if="examineLogContent"
            style="width: 100%; height: 100%;"
            class="ag-theme-material"
            @grid-ready="onGridReady"
            :columnDefs="columnDefs"
            :row-data="examineLogContent.filter((val) => {return val.key !== 'screenshots'})"
            :supress-horisontal-scroll="true"
            :enable-scrolling="true"
            :enableCellTextSelection="true"
            :ensureDomOrder="true"
            @cell-clicked="copyText"
          ></ag-grid-vue>
      </v-card-text>
      <v-card-text v-if="screenshots.length">
        <h5>Screenshots</h5>
        <br>
        <viewer :images="screenshots" class="screenshots" :style="{ height: screenshotsHeight + 'px' }">
          <img v-for="screenshot in screenshots" :src="screenshot.orig"/>
        </viewer>
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
  name: "ExamineCamModal",
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
      ],
      screenshots: []
    }
  },
  props: {
    examineLogContent: Array,
    closeModal: Function
  },
  computed: {
    examineLog() {
      return !!this.examineLogContent
    },
    gridHeight() {
      const computed = ((this.examineLogContent ? this.examineLogContent.length : 0) + 1) * 50
      const max = window.innerHeight * 0.5
      const min = window.innerHeight * 0.2
      return (computed < max ? (computed > min ? computed : min) : max);
    },
    screenshotsHeight() {
      return (window.innerHeight * 0.8) - this.gridHeight
    }
  },
  watch: {
    examineLogContent(content, oldContent) {
      if (content && oldContent) {
        return
      }
      let screenshots = this.examineLogContent && this.examineLogContent.find((elem) => {
        return elem.key === 'screenshots'
      }) || null
      if (screenshots) {
        let id = this.examineLogContent.find((elem) => {
          return elem.key === '_id'
        }).value
        fetch('/events/details/' + id)
            .then((response) => response.json())
            .then((response) => {
              this.screenshots = response
            });
      }
    }
  },
  methods: {
    onGridReady(params) {
      params.api.sizeColumnsToFit()
    },
    close (e) {
      if (e.target.className === "v-overlay__scrim") {
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

<style>
.screenshots {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  overflow-y: auto;
  height: 500px;
}
.screenshots img {
  width: auto;
  height: 150px;
  cursor: pointer;
  margin-right: 20px;
  margin-bottom: 20px;
}
</style>