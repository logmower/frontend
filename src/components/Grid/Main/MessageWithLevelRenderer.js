import { VRow, VCol } from 'vuetify/components/VGrid'
import { VIcon } from 'vuetify/components/VIcon'

export default {
    template: `<v-row>
      <v-col>
        <v-icon :color="color" class="mr-2">{{ icon }}</v-icon>
        {{ message }}
      </v-col>
    </v-row>`,
    components: {
        VRow,
        VCol,
        VIcon
    },
    setup(props) {
        let message = props.params.data.message
        let level = props.params.data.level
        let icons = {
            'emergency': 'mdi-alert-circle',
            'alert': 'mdi-alert-circle',
            'critical': 'mdi-alert-circle',
            'error': 'mdi-alert-circle',
            'warning': 'mdi-alert-circle',
            'notice': 'mdi-alert-circle',
            'info': 'mdi-information',
            'debug': 'mdi-information',
        }
        let colors = {
            'emergency': 'red',
            'alert': 'red',
            'critical': 'red',
            'error': 'red',
            'warning': 'orange',
            'notice': 'orange',
            'info': 'green',
            'debug': 'green',
        }
        let color = colors[level]
        let icon = icons[level]
        return {
            message,
            color,
            icon
        };
    },
};