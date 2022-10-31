export default {
    template: `<div>
      <a @click="openDrawer">View screenshots</a>
      <div v-if="drawerOpen" class="screenshots-drawer">
        <img v-for="screenshot in screenshots" :src="screenshot.orig"/>
      </div>
    </div>`,
    data: function () {
        return {
            screenshots: [],
            drawerOpen: false,
        };
    },
    beforeMount() {
        this.updateImage(this.params);
        this.updateImage(this.params);
    },
    methods: {
        updateImage(params) {
            this.screenshots = params.value
            this.value = params.value;
        },
        refresh(params) {
            this.updateImage(params);
        },
        openDrawer () {
            this.drawerOpen = true
        }
    },
};