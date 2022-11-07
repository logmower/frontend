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
import flattenObj from "../helpers/flattenObj";
import parseEventData from "../helpers/parseEventData";
import {mapActions, mapGetters} from 'vuex';
import config from "./Grid/Main/config";

export default {
  components: {
    ExamineLogModal,
    AgGridVue,
    ComboboxFilter
  },
  data() {
    return {
      examineLogContent: null,
      ...config,
      gridApi: null,
      gridColumnApi: null,
      comboBoxOptions: {},
      es: null,
    }
  },
  computed: {
    filterQuery() {
      return this.$store.state.filterQuery
    },
  },
  watch: {
    filterQuery() {
      this.setupStream()
    },
  },
  created() {
    // TODO: monitor actual URL
    this.setFilterQuery({})
  },
  methods: {
    ...mapActions({
      setFilterOptions: 'setFilterOptions',
      setFilterQuery: 'setFilterQuery',
    }),
    setupStream() {
      this.es && this.es.close();
      let url = new URL('/events', window.location.href);
      for (const key in this.filterQuery) {
        url.searchParams.append(key, this.filterQuery[key]);
      }
      let es = new EventSource(url.toString());
      es.onmessage = (e) => this.handleReceiveMessage(e)
      es.addEventListener("filters", (e) => this.handleReceiveFilters(e))
      es.addEventListener("timeout", (e) => this.handleReceiveTimeout(e))
      this.es = es
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
          this.setFilterQuery(query)
        }
      });
    },
    handleReceiveMessage (event) {
      const eventData = parseEventData(event.data);
      const res = this.gridApi.applyTransaction({
        add: [eventData]
      });
      const rowNode = res.add[0]
      this.gridApi.flashCells({ rowNodes: [rowNode]});
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
