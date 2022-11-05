<template>
  <div style="height: 100%; width: 100%">
  <ag-grid-vue
      style="width: 100%; height: 100%;"
      class="ag-theme-material"
      @grid-ready="onGridReady"
      :defaultColDef="defaultColDef"
      :columnDefs="columnDefs"
      :pagination="true"
      :paginationAutoPageSize=true
      :row-data="null"
      row-selection="single"
      :onRowSelected="openExamineLog"
      :supress-horisontal-scroll="true"
      :enable-scrolling="true"
    ></ag-grid-vue>
    <ExamineLogModal :examine-log-content="examineLogContent" :close-modal="closeExamineLog" />
  </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles//ag-grid.css";
import "ag-grid-community/styles//ag-theme-material.css";
import ExamineLogModal from "./Modal/ExamineLogModal.vue";
import ComboboxFilter from "./Filter/ComboboxFilter.js";

export default {
  components: {
    ExamineLogModal,
    AgGridVue,
    ComboboxFilter
  },
  data() {
    return {
      examineLogContent: null,
      gridApi: null,
      gridColumnApi: null,
      defaultColDef: {
        width: 50,
        initialPinned: true,
        resizable: true,
        enableCellChangeFlash: true
      },
      currentRowCount: 0,
      comboBoxOptions: {},
      viewRowCount: 20,
    }
  },
  computed: {
    columnDefs() {
      return [
        {
          field: '@timestamp',
          width: 70,
          sortable: true
        },
        {
          field: 'kubernetes.namespace',
          headerName: 'namespace',
          tooltipValueGetter: (params) => params.value,
          filter: ComboboxFilter,
          filterParams: {
            options: this.comboBoxOptions['kubernetes.namespace'],
            field: 'kubernetes.namespace',
          }
        },
        {
          field: 'kubernetes.pod.name',
          headerName: 'pod',
          tooltipValueGetter: (params) => params.value,
          filter: ComboboxFilter,
          filterParams: {
            options: this.comboBoxOptions['kubernetes.pod.name'],
            field: 'kubernetes.pod.name',
          }
        },
        {
          field: 'kubernetes.container.name',
          headerName: 'container',
          tooltipValueGetter: (params) => params.value,
          filter: ComboboxFilter,
          filterParams: {
            options: this.comboBoxOptions['kubernetes.container.name'],
            field: 'kubernetes.container.name',
          }
        },
        {
          field: 'message',
          tooltipValueGetter: (params) => params.value,
          width: 500,
        },
        {
          field: 'stream',
        },
      ];
    }
  },
  created() {
    this.setupStream()
  },
  methods: {
    setupStream() {
      let es = new EventSource('/events');
      es.onmessage = (e) => this.handleReceiveMessage(e)
      es.addEventListener("filters", (e) => this.handleReceiveFilters(e))
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    handleReceiveMessage (event) {
      const eventData = this.parseEventData(event.data);
      const res = this.gridApi.applyTransaction({
        add: [eventData]
      });
      const rowNode = res.add[0]
      this.gridApi.flashCells({ rowNodes: [rowNode]});
      this.gridApi.sizeColumnsToFit()
    },
    handleReceiveFilters (event) {
      this.comboBoxOptions = this.parseEventData(event.data);
    },
    parseEventData (eventData) {
      try {
        let json = JSON.parse(eventData)
        if (!json.message) {
          json.message = JSON.stringify(json.json)
        }
        return json
      } catch (e) {
        console.error(e, eventData)
      }
    },
    openExamineLog (row) {
      const selectedRow = row.data
      row.node.setSelected(false)
      this.examineLog = true
      const flattened = flattenObj(selectedRow)
      const pairs = [];
      Object.keys(flattened).map((key) => {
        pairs.push({
          key: key,
          value: flattened[key]
        })
      })
      this.examineLogContent = pairs
    },
    closeExamineLog () {
      this.examineLogContent = null
    }
  },
}

const flattenObj = (ob) => {
  let result = {};
  for (const i in ob) {
    if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
      const temp = flattenObj(ob[i]);
      for (const j in temp) {
        result[i + '.' + j] = temp[j];
      }
    }
    else {
      result[i] = ob[i];
    }
  }
  return result;
};
</script>
