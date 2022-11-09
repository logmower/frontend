import { VChip } from 'vuetify/components/VChip'

export default {
    template: `<v-chip
        class="ma-2"
        :color="color"
        text-color="white"
    >
    {{ displayValue }}
    </v-chip>`,
    components: {
        VChip
    },
    setup(props) {
        let displayValue = props.params.value
        let colors = {
            'error': 'red',
            'info': 'orange',
        }
        let color = colors[displayValue]
        return {
            displayValue,
            color
        };
    },
};