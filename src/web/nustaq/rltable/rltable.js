// requires full real-live dependencies + jquery datatables + ko

var RLTableConfiguration = {
    applyModelColumn2TableColumn: null  // function ( columnModel, tableColDefinition )
};
// supported params: query, table, onSelection: function, height, selectTo: observable selection list, selectRowTo: observable row
ko.components.register('rl-table', {
    template: { element: 'rltabletemplate' },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            var self = {};
            var ttools = null;

            self.onTableClick = function(nodes) {
                if ( this.fnGetSelected ) {
                    if ( ttools == null ) {
                        ttools = this;
                    } else {
                        return;
                    }
                }
                else if ( ttools == null ) {
                    return;
                }
                var selection = ttools.fnGetSelected();
                var selectedRows = [];
                for ( var i = 0; i < selection.length; i++) {
                    var item = self.table.row(selection[i]._DT_RowIndex).data();
                    selectedRows.push(item);
                }
                if ( params && params.onSelection ) {
                    params.onSelection.apply(self,[selectedRows])
                }
                if ( params && params.selectTo ) {
                    params.selectTo(selectedRows);
                }
                if ( params && params.selectRowTo ) {
                    params.selectRowTo(selectedRows);
                }
            };

            if ( ko.isObservable( params.query ) ) {
                params.query.subscribe( function(newQuery) {
                    console.log("query changed "+newQuery);
                    self.pureQuery(params.table, params.query );
                });
            }

            self.query = function( tableName, query ) {

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
                self.pureQuery(tableName,query)
            };

            self.pureQuery = function( tableName, query ) {
                var count = 0;
                var t = self.table;
                t.clear();
                if ( typeof(query) == 'function') {
                    query = query.apply();
                }
                query = query.replace("´","'"); // workaround quoting limits
                query = query.replace("´","'"); // workaround quoting limits
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

            self.tableElem = $(componentInfo.element).find('table');

            self.updateOrCreateTable = function( columDefArray ) {
                if ( self.table ) {
                    self.table.destroy(false);
                    $(self.tableElem).find('th').remove();
                    $(self.tableElem).find('td').remove();
                }

                self.table = self.tableElem.DataTable({
                        dom: 'T<"clear">lfrtip',
                        tableTools: {
                            "sRowSelect": "single",
                            "aButtons": [],
                            "fnRowSelected": self.onTableClick,
                            "fnRowDeSelected": self.onTableClick
                        },
                        tabIndex: true,
                        searching: false,
                        paging: false,
                        //            scrollX: 800,
                        scrollY: params.height ? params.height : 400,
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
            return self;

        }

    }}
);