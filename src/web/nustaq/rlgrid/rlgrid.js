
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
    self.tableMeta = null;
    self.currentSel = null;

    var showElem = function(elem) {
        $(elem).hide().fadeIn(200);
    };
    var hideElem = function(elem) {
        $(elem).fadeOut(200,function() { $(elem).remove(); });
    };

    self.deselect = function(targetElem) {
        targetElem.__selected = false;
        $(targetElem).find("td").removeClass('rl-grid-sel');
        var k = 0, e = targetElem;
        while (e = e.previousSibling) {
            ++k;
        }
        if (k & 1) {
            $(targetElem).find("td").addClass('rl-grid-row-even');
        } else
            $(targetElem).find("td").addClass('rl-grid-row');
    };

    self.initTable = function( tableName ) {
        self.tableElem.empty();
        self.tableMeta = Server.meta().tables[tableName];
        var htm = "<table class='rl-grid-table'><thead><tr style='background-color: #fff;'>"+self.createColumns(tableName)+"</tr></thead><tbody></tbody></table>";
        self.tableElem.append(htm);
        self.tbody = self.tableElem.find("tbody");
        self.tbody.on( "click", function(event) {
            var target = event.target;

            while ( target ) {
                if ( target.nodeName == "TR" ) {
                    console.log("found row "+target.__row);
                    if ( ! target.__selected ) {
                        if ( self.currentSel ) {
                            self.deselect(self.currentSel);
                        }
                        $(target).find("td").removeClass('rl-grid-row');
                        $(target).find("td").removeClass('rl-grid-row-even');
                        $(target).find("td").addClass('rl-grid-sel');
                        self.currentSel = target;
                        target.__selected = true;
                        if ( params.onSelection ) {
                            var k = 0, e = target;
                            while (e = e.previousSibling) {
                                ++k;
                            }
                            params.onSelection.apply(self,[target.__row,k])
                        }
                    } else {
                        self.deselect(target);
                        if ( params.onSelection ) {
                            var k = 0, e = target;
                            while (e = e.previousSibling) {
                                ++k;
                            }
                            params.onSelection.apply(self,[null,k])
                        }
                    }
                    return;
                }
                target = target.parentNode;
                if ( target.nodeName == 'TBODY' || target.nodeName == 'TABLE' )
                    return;
            }
        });
    };

    self.createColumns = function(tableName) {
        var tableMeta = self.tableMeta;
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
        var tableMeta = self.tableMeta;
        var res = "";

        if ( ! tableMeta )
            return;

        var colNames = tableMeta.visibleColumnNames;
        var even = self.tbody.children().length&1;
        for (var i = 0; i < colNames.length; i++) {
            var cn = colNames[i];
            var data = row[cn];
            if ( ! data ) {
                data = "";
            }
            if ( !even )
                res += "<td class='rl-grid-row' id='"+cn+"'>"+ self.renderCell( tableMeta[cn], cn, data)+"</td>";
            else
                res += "<td class='rl-grid-row-even' id='"+cn+"'>"+self.renderCell( tableMeta[cn], cn, data)+"</td>";
        }
        var elem = $("<tr id='" + row.recordKey + "'>" + res + "</tr>");
        self.tbody.append(elem);
        showElem(elem);
        elem.get(0).__row = row;
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

    this.renderCell = function(meta, fieldName, celldata) {
        return "<span id='hilight' style='padding: 4px;'>"+celldata+"</span>";
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
            } else if ( change.type == RL_REMOVE ) {
                var row = self.tbody.find("#"+change.recordKey);
                if ( row ) {
                    hideElem(row);
                }
            } else if ( change.type == RL_UPDATE ) {
                var fieldList = RealLive.getChangedFieldNames(change);
                var recKey = change.recordKey;
                for (var i = 0; i < fieldList.length; i++) {
                    var elementId = '#' + recKey;
                    var rowElem = self.tbody.find(elementId).get(0);
                    if ( rowElem ) {
                        rowElem.__row = change.newRecord;
                        for (var ii = 0; ii < fieldList.length; ii++) {
                            var td = rowElem.querySelector('#'+fieldList[ii]);
                            if ( td ) {
                                td.innerHTML = self.renderCell(
                                    self.tableMeta[fieldList[ii]],
                                    fieldList[ii],
                                    change.appliedChange.newVal[ii]
                                );
                                var toHi = td.querySelector('#hilight');
                                if ( toHi ) {
                                    highlightElem(toHi);
                                } else
                                    highlightElem(td);
                            }
                        }
                    }
                }
            }
        }).then( function(r,e) {
            self.subsId = r;
        });
    };

    if ( ko.isObservable(params.query) ) {
        params.query.subscribe( function(newValue) {
            self.query(params.table,newValue);
        });
    }

    if ( ko.isObservable(params.subscribe) ) {
        params.subscribe.subscribe( function(newValue) {
            self.subscribe(params.table,newValue);
        });
    }

    if ( ko.isObservable(params.table) ) {
        params.table.subscribe( function(newValue) {
            console.log("table change")
        });
    }

    Server.doOnceLoggedIn( function() {
        self.initTable( params.table );
        if ( params.subscribe ) {
            self.subscribe( params.table, params.subscribe );
        } else {
            self.runQuery( params.table, params.query ? params.query : "true" );
        }
    });

}
