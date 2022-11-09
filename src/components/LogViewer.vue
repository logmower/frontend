<template>
  <div style="height: 100%; width: 100%; text-align: right">
      <v-btn
          color="blue-grey"
          class="ma-2"
          :prepend-icon="streaming ? 'mdi-pause' :'mdi-play'"
          @click="toggleFilterQueryStreaming"
      >
        Stream new lines
      </v-btn>
  <ag-grid-vue
      style="width: 100%; height: calc(100% - 52px);"
      class="ag-theme-material"
      @grid-ready="onGridReady"
      :defaultColDef="defaultColDef"
      :columnDefs="columnDefs"
      :getRowId="params => params.data._id"
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
import { VBtn } from 'vuetify/components/VBtn'
import ExamineLogModal from "./Modal/ExamineLogModal.vue";
import ComboboxFilter from "./Filter/ComboboxFilter.js";
import ErrLevelRenderer from "./Grid/Main/ErrLevelRenderer";
import flattenObj from "../helpers/flattenObj";
import parseEventData from "../helpers/parseEventData";
import {mapActions, mapGetters} from 'vuex';
import config from "./Grid/Main/config";

export default {
  components: {
    ExamineLogModal,
    AgGridVue,
    ComboboxFilter,
    ErrLevelRenderer,
    VBtn
  },
  data() {
    return {
      examineLogContent: null,
      ...config,
      gridApi: null,
      gridColumnApi: null,
      comboBoxOptions: {},
      es: null,
      initialFilter: null,
    }
  },
  computed: {
    ...mapGetters([
      'filterQuery',
      'streaming',
    ]),
  },
  watch: {
    filterQuery() {
      this.setupStream()
    },
    streaming() {
      this.setupStream()
    },
  },
  created() {
    let queryParams = new URLSearchParams(window.location.search);
    queryParams = Object.fromEntries(queryParams);
    this.initialFilter = queryParams
    queryParams['initial'] = true
    this.setFilterQuery(queryParams)
  },
  methods: {
    ...mapActions({
      setFilterOptions: 'setFilterOptions',
      setFilterQuery: 'setFilterQuery',
      toggleFilterQueryStreaming: 'toggleFilterQueryStreaming',
    }),
    setupStream() {
      this.es && this.es.close();
      let url = new URL('/events', window.location.href);
      for (const key in this.filterQuery) {
        url.searchParams.append(key, this.filterQuery[key]);
      }
      if (url.searchParams.keys().next()) {
        let es = new EventSource(url.toString());
        es.onmessage = (e) => this.handleReceiveMessage(e)
        es.addEventListener("filters", (e) => this.handleReceiveFilters(e))
        es.addEventListener("timeout", (e) => this.handleReceiveTimeout(e))
        this.es = es
      }
      url.searchParams.delete('initial')
      if (url.searchParams.get('streaming') === 'false') {
        url.searchParams.delete('streaming')
      }
      window.history.replaceState({}, '', `${location.pathname}?${url.searchParams.toString()}`);
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      this.gridColumnApi.applyColumnState({
        state: [{
            colId: '@timestamp',
            sort: 'desc'
          }]
      });

      for (let k in this.initialFilter) {
        let filterInstance = params.api.getFilterInstance(k);
        if (filterInstance) {
          filterInstance.updateFilter(this.initialFilter[k]);
        }
      }
      params.api.onFilterChanged();
      this.initialFilter = null

      this.gridApi.addGlobalListener((type, event) => {
        if (type === 'filterChanged') {
          let changedColumn = event.columns[0] ? (event.columns[0].colId) : null
          let query = {}
          let gridColumns = event.columnApi.columnModel.gridColumns
          gridColumns.map((column) => {
            // Reset child column filter if parent changed
            let parentColumn = column?.colDef?.filterParams?.parentColumn
            if (parentColumn && changedColumn === parentColumn) {
              let filterInstance = this.gridApi.getFilterInstance(column.colId);
              column.filterActive = null
              filterInstance.updateFilter(null)
              this.gridApi.onFilterChanged();
            }
            if (column.filterActive) {
              query[column.colId] = column.filterActive
            }
          })
          query['streaming'] = this.streaming
          this.setFilterQuery(query)
        }
      });
    },
    handleReceiveMessage (event) {
      const eventData = parseEventData(event.data);
      if (!this.gridApi.getRowNode(eventData._id)) {
        this.gridApi.applyTransactionAsync({
          add: [eventData]
        }, (res) => {
          const rowNode = res.add[0]
          this.gridApi.flashCells({ rowNodes: [rowNode]});
        })
      }
    },
    handleReceiveFilters (event) {
      let data = parseEventData(event.data);
      let opts = this.comboBoxOptions
      for (let k in data) {
        if (!(k in opts)) {
          opts[k] = []
        }
        // TODO: proper merging
        if ((data[k].parentKey) || (opts[k].length === 0)) {
          opts[k].push(data[k])
        }
      }
      this.comboBoxOptions = opts

      let correctOptions = {};
      for (let column in opts) {
          correctOptions[column] = []
          let columnDef = this.columnDefs.find((columnDef) => {
            return columnDef.field === column
          });
          let parentColumnName = columnDef?.filterParams?.parentColumn;
          let possibleColumnOptions = opts[column].filter((k) => {
            return k.parentKey === parentColumnName
          })
          if (possibleColumnOptions.length === 1) {
            correctOptions[column] = possibleColumnOptions[0].options
          } else if (possibleColumnOptions.length > 1) {
            let filterInstance = this.gridApi.getFilterInstance(parentColumnName)
            possibleColumnOptions.forEach((opt) => {
              if (filterInstance && (opt.parentValue === filterInstance.filter)) {
                correctOptions[column] = opt.options
              }
            })
         }
      }
      this.gridApi.sizeColumnsToFit()

      this.setFilterOptions(correctOptions)
    },
    handleReceiveTimeout () {
      this.$toast.warning(`Not all rows were loaded. Please use more precise filtering`, {
        position: "top-right",
      });
      setTimeout(this.$toast.clear, 3000);
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


</script>
