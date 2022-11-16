import { VRow, VCol } from 'vuetify/components/VGrid'
import 'ansi-to-html'
import Convert from "ansi-to-html";

export default {
    template: `<v-row>
      <v-col>
        <span v-html="message"></span>
      </v-col>
    </v-row>`,
    components: {
        VRow,
        VCol,
    },
    setup(props) {
        let message;
        if (props.params.data.key === 'message') {
            let parser = new Convert()
            message = parser.toHtml(props.params.value)
        } else {
            message = props.params.value
        }
        return {
            message
        }
    },
};