
ko.components.register('rl-grid', {
    template: 'none',
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new RLGridModel(params,componentInfo);
        }
    }
});

function rlEscapeId( str ) {
    return str.replace(/#/g, "_");
}

// a map from style to a formatting function (JColumnMeta, fieldName, cellData)
var RLFormatterMap = {
    "Price": function(meta, fieldName, celldata) {
        return "<b>"+Number(celldata/100).toFixed(2)+"</b>";
    }
};

// table
function RLGridModel(params,componentInfo) {
    var self = this;

    self.tableElem = $(componentInfo.element);
    self.tbody = null;
    self.tableMeta = null;
    self.currentSel = null;
    self.sortKey = 'recordKey';
    self.snapshotDone = false;

    var showElem = function(elem) {
        $(elem).hide().fadeIn(400);
    };
    var hideElem = function(elem) {
        $(elem).fadeOut(400,function() { $(elem).remove(); });
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

    function visibleColumnNames() {
        if ( params.columns )
            return params.columns;
        return self.tableMeta.visibleColumnNames;
    }

    self.createColumns = function(tableName) {

        var tableMeta = self.tableMeta;
        var res = "";

        if ( ! tableMeta )
            return;

        var colNames = visibleColumnNames();
        for (var i = 0; i < colNames.length; i++) {
            var cn = colNames[i];
            var colMeta = tableMeta.columns[cn];
            var title = colMeta.displayName;
            var width = colMeta.displayWidth;
            if ( ! width )
                width = '';
            else
                width = "style: 'width:'"+width+";'";
            if ( ! title ) {
                title = colMeta.name;
            }
            res += "<td class='rl-grid-col' "+width+">"+title+"</td>";
        }
        return res;
    };

    self.clear = function() {
        self.unsubscribe();
        self.snapshotDone = false;
        if ( self.tbody )
            self.tbody.empty();
    };

    function findPos( row ) {
        var children = self.tbody.children();
        var me = row[self.sortKey];
        for ( var i = 0; i < children.length; i++ ) {
            var tr = children[i];
            var trRow = tr.__row;
            if ( trRow ) {
                var that = trRow[self.sortKey];
                if ( that && that > me ) {
                    return tr;
                }
            }
        }
        return null;
    }

    self.updateStripes = function( startIndex ) {
        var children = self.tbody.children();
        for ( var i = startIndex; i < children.length; i++ ) {
            var tr = $(children[i]);
            var tds = tr.children();
            for ( var ii = 0; ii < tds.length; ii++ ) {
                var td = $(tds[ii]);
                if ( i&1 ) {
                    td.removeClass('rl-grid-row');
                    td.addClass('rl-grid-row-even');
                } else {
                    $(tr).removeClass('rl-grid-row-even');
                    $(tr).addClass('rl-grid-row');
                }
            }
        }
    };

    self.addRowData = function(tableName,row) {
        var tableMeta = self.tableMeta;
        var res = "";

        if ( ! tableMeta )
            return;

        var colNames = visibleColumnNames();
        for (var i = 0; i < colNames.length; i++) {
            var cn = colNames[i];
            var data = row[cn];
            if ( ! data ) {
                data = "";
            }
            var align = tableMeta.columns[cn].align;
            if ( align ) {
                align = " align='"+align+"' "
            } else
                align = "";
            res += "<td class='rl-grid-row' id='"+cn+"'"+align+">"+ self.renderCell( tableMeta.columns[cn], cn, data)+"</td>";
        }
        var elem = $("<tr id='" + rlEscapeId(row.recordKey) + "'>" + res + "</tr>");
        var insert = findPos(row);
        if ( insert ) {
            self.tbody.get(0).insertBefore( elem.get(0), insert);
        } else {
            self.tbody.append(elem);
        }
        if ( self.snapshotDone )
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
            } else {
                self.updateStripes(0);
                self.snapshotDone = true;
            }
        });
    };

    this.unsubscribe = function() {
        if ( self.subsId ) {
            Server.session().$unsubscribe(self.subsId);
            self.subsId = null;
        }
    };

    this.formatCell = function(meta, fieldName, celldata) {
        if ( meta.renderStyle ) {
            var formatter = RLFormatterMap[meta.renderStyle];
            if ( formatter ) {
                return formatter.apply(null,[meta,fieldName,celldata]);
            }
        }
        return celldata;
    };

    // applies color styles and stuff. Pure formatting is done by formatter
    this.renderCell = function(meta, fieldName, celldata) {
        var styleAdditions = '';
        if ( meta.bgColor ) {
            styleAdditions += " background-color: "+meta.bgColor+";";
        }
        if ( meta.textColor ) {
            styleAdditions += " color: "+meta.textColor+";";
        }
        return "<span id='hilight' style='padding: 4px; "+styleAdditions+" '>"+self.formatCell(meta,fieldName,celldata)+"</span>";
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
                if ( self.snapshotDone ) {
                    self.updateStripes(0);
                }
            } else if ( change.type == RL_REMOVE ) {
                var row = self.tbody.find("#"+rlEscapeId(change.recordKey));
                if ( row ) {
                    hideElem(row);
                }
                if ( self.snapshotDone ) {
                    self.updateStripes(0);
                }
            } else if ( change.type == RL_UPDATE ) {
                var fieldList = RealLive.getChangedFieldNames(change);
                var recKey = change.recordKey;
                for (var i = 0; i < fieldList.length; i++) {
                    var elementId = '#' + rlEscapeId(recKey);
                    var rowElem = self.tbody.find(elementId).get(0);
                    if ( rowElem ) {
                        rowElem.__row = change.newRecord;
                        for (var ii = 0; ii < fieldList.length; ii++) {
                            var td = rowElem.querySelector('#'+fieldList[ii]);
                            if ( td ) {
                                td.innerHTML = self.renderCell(
                                    self.tableMeta.columns[fieldList[ii]],
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
            } else if ( change.type == RL_SNAPSHOT_DONE ) {
                self.snapshotDone = true;
                self.updateStripes(0);
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
