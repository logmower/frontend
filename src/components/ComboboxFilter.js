export default {
    template: `
      <select v-model="filter" class="v-select">
        <option value=""> </option>
        <option v-for="option in params.options" :value="option">
           {{ option }}
        </option>
      </select>
    `,
    data: function () {
        return {
            filter: '',
        };
    },
    methods: {
        updateFilter() {
            this.params.filterChangedCallback();
        },

        doesFilterPass(params) {
            const value = this.params.field.split('.').reduce((a, b) => a[b], params.data);
            return value === this.filter;
        },

        isFilterActive() {
            return this.filter !== ''
        },
    },
};