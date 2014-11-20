
ko.components.register('rl-grid', {
//    template: { element: 'rlgridtemplate' },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new RLGridModel(params,componentInfo);
        }
    }
});

// table
function RLGridModel(params,componentInfo) {
    var self = this;

    self.tableElem = $(componentInfo.element);
    self.table = null;

    self.initTable = function( tableName ) {
        self.tableElem.empty();
        self.tableElem.append("<table>");
    };

    self.createColumns = function(tableName) {
        var tableMeta = Server.meta().tables[tableName];

        if ( ! tableMeta )
            return;

        var colNames = tableMeta.visibleColumnNames;
        for (var i = 0; i < colNames.length; i++) {
            var cn = colNames[i];
            var colMeta = tableMeta.columns[cn];
            var title = colMeta.displayName;
            if ( ! title ) {
                title = colMeta.name;
            }
            if ( colMeta.displayWidth ) {
                colDef.width = colMeta.displayWidth;
            }
        }
    };


    this.runQuery = function( tableName, query ) {
        var count = 0;
        self.table.clearGridData( false );
        if ( typeof(query) == 'function') {
            query = query.apply();
        }
        query = query.replace("´","'"); // workaround quoting limits
        query = query.replace("´","'"); // workaround quoting limits
        Server.session().$query(tableName, query, function (change, error) {
            //console.log(change);
            if (change.type != RL_SNAPSHOT_DONE) {
                self.addRowData( rlgrid_rowIdCnt++, change.newRecord );
                count++;
                if (count > 100) {
                    //t.draw();
                    count = 0;
                }
            } else {
                self.refresh();
            }
        });

    };

    Server.doOnceLoggedIn( function() {
        self.initTable( params.table );
        self.runQuery( params.table, params.query );
    });

}
