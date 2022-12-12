export default {
    template: `<div>
      <div class="screenshots-drawer">
        <img v-for="screenshot in screenshots" :src="screenshot.thumb"/>
      </div>
    </div>`,
    data: function () {
        return {
            screenshots: [],
        };
    },
    beforeMount() {
        this.updateImage(this.params);
    },
    methods: {
        updateImage(params) {
            this.screenshots = params.value
        },
    },
};
