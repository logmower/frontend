<template>
  <div style="height: 100%; width: 100%;" v-resize="onResize">
    <Header :refresh-filter-state="refreshFilterState" :title="backend" @setup-stream="setupStream" />
    <ag-grid-vue
      v-if="columnDefs"
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
      :isExternalFilterPresent="() => {return true}"
      :doesExternalFilterPass="doesExternalFilterPass"
      :loadingOverlayComponent="'loadingOverlay'"
    ></ag-grid-vue>
    <ExamineLogModal v-if="backend === 'logmower'" :examine-log-content="examineLogContent" :close-modal="closeExamineLog" />
    <ExamineCamModal v-if="backend === 'camtiler'" :examine-log-content="examineLogContent" :close-modal="closeExamineLog" />
  </div>
</template>

<script>
import { AgGridVue } from "ag-grid-vue3";
import "ag-grid-community/styles//ag-grid.css";
import "ag-grid-community/styles//ag-theme-material.css";
import { Resize } from 'vuetify/directives';
import ExamineLogModal from "./Modal/ExamineLogModal.vue";
import ExamineCamModal from "./Modal/ExamineCamModal.vue";
import ComboboxFilter from "./Grid/Main/Filter/ComboboxFilter.js";
import MessageWithLevelRenderer from "./Grid/Main/MessageWithLevelRenderer";
import ScreenshotRenderer from "./Grid/Main/ScreenshotRenderer";
import flattenObj from "../helpers/flattenObj";
import parseEventData from "../helpers/parseEventData";
import {mapActions, mapGetters} from 'vuex';
import loadingOverlay from "./Grid/Main/loadingOverlay";
import Header from "./Header/Header.vue";

export default {
  components: {
    Header,
    ExamineLogModal, // TODO: dynamic loading
    ExamineCamModal,
    AgGridVue,
    ComboboxFilter,
    MessageWithLevelRenderer,
    ScreenshotRenderer,
    loadingOverlay
  },
  directives: {
    Resize
  },
  data() {
    return {
      examineLogContent: null,
      gridApi: null,
      gridColumnApi: null,
      comboBoxOptions: {},
      es: null,
      initialFilter: null,
      defaultColDef: null,
      columnDefs: null,
      backend: 'logmower'
    }
  },
  computed: {
    ...mapGetters([
      'filterQuery',
      'streaming'
    ]),
  },
  watch: {
    filterQuery() {
      if (this.backend) {
        this.setupStream()
      }
    },
    streaming() {
      if (this.backend) {
        this.setupStream()
      }
    },
  },
  created() {
    fetch('/events/backend')
        .then((response) => response.text())
        .then((response) => {
          this.backend = response // TODO handle bad gateway etc
          import(`./Grid/Main/configs/${response}.js`)
              .then(module => {
                this.defaultColDef = module.default.defaultColDef
                this.columnDefs = module.default.columnDefs
              }).catch(err => {
                console.error(err)
                this.$toast.error(`Backend '${response}' not supported`, {
                position: "top-right",
            });
          }).then(() => {
            let queryParams = new URLSearchParams(window.location.search);
            queryParams = Object.fromEntries(queryParams);
            this.initialFilter = queryParams
            queryParams['initial'] = true
            queryParams['from'] && (queryParams['from'] = Number(queryParams['from']))
            queryParams['to'] && (queryParams['to'] = Number(queryParams['to']))
            this.setFilterQuery(queryParams)
          });
      })
  },
  methods: {
    ...mapActions({
      setFilterOptions: 'setFilterOptions',
      setFilterQuery: 'setFilterQuery',
      setLastPingReceived: 'setLastPingReceived',
    }),
    onResize () {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit()
      }
    },
    refreshFilterState() {
      this.gridApi.onFilterChanged();
    },
    setupStream() {
      this.es && this.es.close();
      let url = new URL('/events', window.location.href);
      for (const key in this.filterQuery) {
        url.searchParams.append(key, this.filterQuery[key]);
      }
      if (url.searchParams.keys().next()) {
        let es = new EventSource(url.toString());
        es.onmessage = (e) => this.handleReceiveMessage(e)
        es.addEventListener("ping", (e) => this.handleReceivePing())
        es.addEventListener("filters", (e) => this.handleReceiveFilters(e))
        es.addEventListener("timeout", (e) => this.handleReceiveTimeout(e))
        es.addEventListener("completed", (e) => this.handleAllReceived(e))
        this.es = es
        if (this.gridApi) {
          this.gridApi.showLoadingOverlay();
        }
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
          this.filterQuery.from && (query['from'] = this.filterQuery.from)
          this.filterQuery.to && (query['to'] = this.filterQuery.to)
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
      this.gridApi.hideOverlay();
    },
    handleAllReceived () {
      this.gridApi.hideOverlay();
    },
    handleReceivePing () {
      this.setLastPingReceived()
    },
    doesExternalFilterPass(node) {
      if (node.data && this.filterQuery.from && this.filterQuery.to) {
        let ts = new Date(node.data['@timestamp']).getTime()
        return (ts >= this.filterQuery.from && ts <= this.filterQuery.to)
      }
      return true;
    },
    openExamineLog (row) {
      const selectedRow = row.data
      row.node.setSelected(false)
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
