import ComboboxFilter from "../../Filter/ComboboxFilter";

const config = {
    getRowId: params => params.data._id,
    defaultColDef: {
        width: 120,
        initialPinned: true,
        resizable: true,
        enableCellChangeFlash: true
    },
    columnDefs: [
        {
            field: '@timestamp',
            width: 120,
            sortable: true
        },
        {
            field: 'kubernetes.namespace',
            headerName: 'namespace',
            tooltipValueGetter: (params) => params.value,
            filter: ComboboxFilter,
            filterParams: {
                options: [],
                field: 'kubernetes.namespace',
                parentColumn: null,
            }
        },
        {
            field: 'kubernetes.pod.name',
            headerName: 'pod',
            tooltipValueGetter: (params) => params.value,
            filter: ComboboxFilter,
            filterParams: {
                options: [],
                field: 'kubernetes.pod.name',
                parentColumn: 'kubernetes.namespace',
            }
        },
        {
            field: 'kubernetes.container.name',
            headerName: 'container',
            tooltipValueGetter: (params) => params.value,
            filter: ComboboxFilter,
            filterParams: {
                options: [],
                field: 'kubernetes.container.name',
                parentColumn: 'kubernetes.pod.name',
            }
        },
        {
            field: 'message',
            tooltipValueGetter: (params) => params.value,
            width: 500,
        },
        {
            field: 'stream',
        },
    ],
}

export default config