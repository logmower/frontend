const config = {
    defaultColDef: {
        width: 120,
        initialPinned: true,
        resizable: true,
        enableCellChangeFlash: true
    },
    columnDefs: [
        {
            field: '@timestamp',
            width: 140,
            sortable: true
        },
        {
            field: 'source',
            tooltipValueGetter: (params) => params.value,
            filter: 'ComboboxFilter',
            filterParams: {
                options: [],
                field: 'source',
                parentColumn: null,
            }
        },
        {
            field: 'event',
            tooltipValueGetter: (params) => params.value,
        },
        {
            field: 'started',
            width: 140,
            tooltipValueGetter: (params) => params.value,
        },
        {
            field: 'finished',
            width: 140,
            tooltipValueGetter: (params) => params.value,
        },
        {
            field: 'screenshots',
            cellRenderer: 'ScreenshotRenderer',
            width: 450,
        },
    ],
}

export default config