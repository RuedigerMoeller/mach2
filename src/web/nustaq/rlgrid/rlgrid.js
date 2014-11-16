
ko.components.register('rl-grid', {
    template: { element: 'rlgridtemplate' },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new RLGridModel(params,componentInfo);
        }
    }
});

var rlgrid_rowIdCnt = 1;

// table
function RLGridModel(params,componentInfo) {
    var self = this;

    self.tableElem = $(componentInfo.element).find('table');
    self.tableElem.id = "_rl_"+rlgrid_rowIdCnt++;
    self.table = null;

    self.createColumnModel = function(tableName) {
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
            var colDef = { name: colMeta.name, label: title };

            if ( colMeta.displayWidth ) {
                colDef.width = colMeta.displayWidth;
            }

            if ( RLTableConfiguration.applyModelColumn2TableColumn != null ) {
                RLTableConfiguration.applyModelColumn2TableColumn(colMeta,colDef);
            }

            colConfig.push( colDef );
        }
        return colConfig;
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
                self.table.addRowData( rlgrid_rowIdCnt++, change.newRecord );
                count++;
                if (count > 100) {
                    //t.draw();
                    count = 0;
                }
            } else {
                self.table.trigger("reloadGrid");
            }
        });

    };

    this.initTable = function() {
        self.table = self.tableElem.jqGrid({
            height: params.height ? params.height : 200,
            datatype: 'local',
            colModel: self.createColumnModel(params.table),
            rowNum: 100,
            rowList: [10, 20, 30],
            sortname: "recordKey",
            sortorder: "desc",
            viewrecords: true,
            gridview: false
        });
    };

    Server.doOnceLoggedIn( function() {
        self.initTable();
        self.runQuery( params.table, params.query );
    });

}
