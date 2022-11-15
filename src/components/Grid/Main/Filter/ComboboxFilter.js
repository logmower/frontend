import Combobox from "./Combobox.vue";

export default {
    // This is a helper component to translate between ag-grid's custom filter logic and a regular Vue component
    // https://www.ag-grid.com/vue-data-grid/component-filter/#custom-filter-interface-3
    components: {
      Combobox
    },
    template: `<Combobox
        :field="params.field"
        :filter="filter"
        :change-value="updateFilter"
        :placeholder="placeholder"
    />`,
    mounted() {
        this.params.api.sizeColumnsToFit()
    },
    data: function () {
        return {
            filter: '',
        };
    },
    computed: {
      placeholder() {
          let parentColumnName = this.params.column.userProvidedColDef.filterParams.parentColumn
          if (parentColumnName) {
              let filterInstance = this.params.api.getFilterInstance(parentColumnName)
              if (!filterInstance.filter || filterInstance.filter === '') {
                  let displayName = filterInstance.params.column.userProvidedColDef.headerName
                  return `Please select ${displayName} first`
              }
          }
          return ''
      }
    },
    methods: {
        updateFilter(value) {
            this.filter = value
            this.params.filterChangedCallback();
        },

        doesFilterPass(params) {
            const value = this.params.field.split('.').reduce((a, b) => a[b], params.data);
            return value === this.filter;
        },

        isFilterActive() {
            return this.filter !== '' && this.filter
        },
    },
};