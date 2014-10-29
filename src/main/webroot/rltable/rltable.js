// requires full real-live dependencies + jquery datatables + ko

var RLTableConfiguration = {
    applyModelColumn2TableColumn: null  // function ( columnModel, tableColDefinition )
};

ko.components.register('rl-table', {
    template: { element: 'rltabletemplate' },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            var self = this;

            this.query = function( tableName, query ) {
                var count = 0;

                var tableMeta = Server.meta().tables[tableName];

                if ( ! tableMeta )
                    return;

                var colNames = tableMeta.visibleColumnNames;
                var colConfig = [];
                for (var i = 0; i < colNames.length; i++) {
                    var cn = colNames[i];
                    var colMeta = tableMeta.columns[cn];
                    var title = colMeta.displayName;
                    if ( ! title ) {
                        title = colMeta.name;
                    }
                    var colDef = { data: colMeta.name, title: title };

                    if ( colMeta.displayWidth ) {
                        colDef.width = colMeta.displayWidth;
                    }

                    if ( RLTableConfiguration.applyModelColumn2TableColumn != null ) {
                        RLTableConfiguration.applyModelColumn2TableColumn(colMeta,colDef);
                    }

                    colConfig.push( colDef );
                }

                self.updateOrCreateTable(colConfig);
                var t = self.table;
                Server.session().$query(tableName, query, function (change, error) {
                    //console.log(change);
                    if (change.type != RL_SNAPSHOT_DONE) {
                        t.row.add(change.newRecord);
                        count++;
                        if (count > 100) {
                            t.draw();
                            count = 0;
                        }
                    } else {
                        t.draw();
                    }
                });
            };

            this.tableElem = $(componentInfo.element).find('table');

            this.updateOrCreateTable = function( columDefArray ) {
                if ( this.table ) {
                    this.table.destroy(false);
                    $(this.tableElem).find('th').remove();
                    $(this.tableElem).find('td').remove();
                }

                this.table = this.tableElem.DataTable({
                        dom: 'T<"clear">lfrtip',
                        tableTools: {
                            "sRowSelect": "single",
                            "aButtons": []
                        },
                        tabIndex: true,
                        searching: false,
                        paging: false,
                        //            scrollX: 800,
                        scrollY: 400,
                        autoWidth: true,
                        //            jQueryUI: true,
                        data: [],
                        columns: columDefArray
    //                        { data: "name", title: "Name" },
    //                        { data: "other", title: "Other" },
    //                        { data: "x", title: "X" },
    //                        { data: "y", title: "Y" },
    //                        { data: "z", title: "Z" }
    //                    ]
                    });
            };



            // init
            if ( params && params.table && params.query ) {
                if ( Server.loggedIn() ) {
                    self.query(params.table, params.query );
                } else {
                    self.updateOrCreateTable([ {} ]);
                    Server.loggedIn.subscribe( function(loggedin) {
                        if ( loggedin ) {
                            self.query(params.table, params.query );
                        }
                    });
                }
            }

        }

    }}
);