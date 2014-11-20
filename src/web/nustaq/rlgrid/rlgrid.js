
ko.components.register('rl-grid', {
    template: 'none',
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
    self.tbody = null;

    var showElem = function(elem) {
        $(elem).hide().fadeIn(200);
    };
    var hideElem = function(elem) {
        $(elem).fadeOut(200,function() { $(elem).remove(); });
    };


    self.initTable = function( tableName ) {
        self.tableElem.empty();
        var htm = "<table class='rl-grid-table'><thead><tr style='background-color: #fff;'>"+self.createColumns(tableName)+"</tr></thead><tbody></tbody></table>";
        self.tableElem.append(htm);
        self.tbody = self.tableElem.find("tbody");
    };

    self.createColumns = function(tableName) {
        var tableMeta = Server.meta().tables[tableName];
        var res = "";

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
            res += "<td class='rl-grid-col'>"+title+"</td>";
        }
        return res;
    };

    self.clear = function() {
        self.unsubscribe();
        if ( self.tbody )
            self.tbody.empty();
    };

    self.addRowData = function(tableName,row) {
        var tableMeta = Server.meta().tables[tableName];
        var res = "";

        if ( ! tableMeta )
            return;

        var colNames = tableMeta.visibleColumnNames;
        var even = self.tbody.children().length&1;
        for (var i = 0; i < colNames.length; i++) {
            var cn = colNames[i];
            var colMeta = tableMeta.columns[cn];
            var data = row[cn];
            if ( ! data ) {
                data = "";
            }
            if ( !even )
                res += "<td class='rl-grid-row'>"+data+"</td>";
            else
                res += "<td class='rl-grid-row-even'>"+data+"</td>";
        }
        var elem = $("<tr id='" + row.recordKey + "'>" + res + "</tr>");
        self.tbody.append(elem);
        showElem(elem);
    };

    this.runQuery = function( tableName, query ) {
        self.clear();
        if ( typeof(query) == 'function') {
            query = query.apply();
        }
        query = query.replace("´","'"); // workaround quoting limits
        query = query.replace("´","'"); // workaround quoting limits
        Server.session().$query(tableName, query, function (change, error) {
            if (change.type == RL_ADD) {
                self.addRowData( tableName, change.newRecord );
            }
        });
    };

    this.unsubscribe = function() {
        if ( self.subsId ) {
            Server.session().$unsubscribe(self.subsId);
            self.subsId = null;
        }
    };

    this.subscribe = function( tableName, query ) {
        self.clear();
        if ( typeof(query) == 'function') {
            query = query.apply();
        }
        query = query.replace("´","'"); // workaround quoting limits
        query = query.replace("´","'"); // workaround quoting limits
        Server.session().$subscribe(tableName, query, function (change, error) {
            if (change.type == RL_ADD) {
                self.addRowData( tableName, change.newRecord );
                if (count > 100) {
                    //t.draw();
                    count = 0;
                }
            } else if ( change.type == RL_REMOVE ) {
                var row = self.tbody.find("#"+change.recordKey);
                if ( row ) {
                    hideElem(row);
                }
            }
        }).then( function(r,e) { self.subsId = r; });
    };

    Server.doOnceLoggedIn( function() {
        self.initTable( params.table );
        if ( params.subscribe ) {
            self.subscribe( params.table, params.subscribe );
        } else {
            self.runQuery( params.table, params.query ? params.query : "true" );
        }
    });

}
