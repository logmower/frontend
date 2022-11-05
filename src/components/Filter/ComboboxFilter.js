import Combobox from "./Combobox.vue";

export default {
    // This is a helper component to translate between ag-grid's custom filter logic and a regular Vue component
    // https://www.ag-grid.com/vue-data-grid/component-filter/#custom-filter-interface-3
    components: {
      Combobox
    },
    template: `<Combobox
      :options="params.options"
      :change-value="updateFilter"
    />`,
    data: function () {
        return {
            filter: '',
        };
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