import { VRow, VCol } from 'vuetify/components/VGrid'
import { VIcon } from 'vuetify/components/VIcon'
import 'ansi-to-html'
import Convert from "ansi-to-html";


export default {
    template: `<v-row>
      <v-col>
        <v-icon v-if="icon" :color="color" class="mr-2">{{ icon }}</v-icon>
        <span v-html="message"></span>
      </v-col>
    </v-row>`,
    components: {
        VRow,
        VCol,
        VIcon
    },
    setup(props) {
        let message = props.params.value
        let converter = new Convert()
        message = converter.toHtml(message)
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
        let color = colors[level] ?? null
        let icon = icons[level] ?? null
        return {
            message,
            color,
            icon
        };
    },
};