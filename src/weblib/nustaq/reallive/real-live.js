// version 2 of js RealLive facade as callback/connection management moved to kontraktor
// requires kontraktor.js

var RL_UPDATE    = 0;
var RL_ADD       = 1;
var RL_REMOVE    = 2;
var RL_OPERATION = 3;
var RL_SNAPSHOT_DONE = 4;
var RL_ERROR = 5;

var RealLive = new function() {

    var self = this;

    self.getChangedFieldNames = function(change) {
        var res = [];
        if (change.appliedChange) {
            var changeArray = change.appliedChange.fieldIndex;
            for ( var i = 0; i < changeArray.length; i++ ) {
                var fieldId = changeArray[i];
                res.push(RealLive.getFieldName(change.tableId,fieldId));
            }
        }
        return res;
    };

    self.getTableMeta = function(tableId,columnName) {
        var res = Server.meta().tables[tableId];
        if ( columnName ) {
            return res.columns[columnName];
        }
        return res;
    };

    self.getFieldName = function(tableId,fieldId) {
        if ( self.getTableMeta( tableId) ) {
            return self.getTableMeta(tableId).fieldId2Name[fieldId];
        }
        console.log("unknown table "+tableId+" "+fieldId);
    };

    // compute ordered visible columns
    self.visibleColumns = function( columns ) {
        var result = [];
        for( key in columns ) {
            if ( columns.hasOwnProperty(key) ) {
                var value = columns[key];

                if (!value['hidden']) {
                    value._key = key;
                    result.push(value);
                }
            }
        }
        result.sort(function (a,b) { return a.order- b.order; });

        var names = [];
        var i;
        for( i = 0; i < result.length; i++ ) {
            names.push(result[i].name);
        }
        return names;
    };

    self.enrichModel = function (model) {
        console.log("model:"+model);
        model.tables.SysTable.columns.meta.hidden = true;

        // add fieldId2Name map to each table
        var tableName;
        for ( tableName in model.tables ) {
            console.log(tableName);
            if ( tableName != '__typeInfo' ) {
                var indexToFieldName = [];
                model.tables[tableName].fieldId2Name = indexToFieldName;
                var cols = model.tables[tableName].columns;
                model.tables[tableName].visibleColumnNames = self.visibleColumns(cols);
                var colName;
                for ( colName in  cols ) {
                    if ( colName != '__typeInfo' && ! colName.hidden ) {
                        indexToFieldName[cols[colName].fieldId] = cols[colName].name;
                    }
                }
            }
        }
    };

};

function RLResultSet( table, query, subscribeFun /*optional table, query, callback */ ) {

    var self = this;

    self.map = {};
    self.preChangeHook = null;
    self.postChangeHook = null;
    self.snapFin = false;
    self.subsId = null;
    self.subsCB = null;
    self.snapFinFun = null;
    self.insertFun = null; // function(list,newItem) defining insert point in list.

    // fnFronendquery: filterfunction(record)
    self.subscribe = function( table, query, fnFrontendQuery ) {
        self.unsubscribeAndClear();
        self.subscb = function (change, e) {
            if (fnFrontendQuery && change.type == RL_ADD) {
                if (!fnFrontendQuery.apply(self, [change.newRecord])) {
                    return;
                }
            }
            self.push(change);
        };
        var cbProc = function (subsId, err) {
            self.subsId = subsId;
        };
        if ( subscribeFun ) {
            subscribeFun.apply(null,[table, query, self.subscb]).then(cbProc);
        } else {
            Server.session().$subscribe( table, query, self.subscb ).then(cbProc);
        }
        return self;
    };

    self.query = function( table, query ) {
        self.unsubscribe();
        Server.session().$query( table, query, self.subscb = function(change,e) {
            self.push(change);
        });
    };

    self.unsubscribe = function() {
        if ( self.subsId ) {
            Server.unregisterCB(self.subsCB);
            Server.session().$unsubscribe(self.subsId);
            self.subsId = null;
            self.subsCB = null;
            self.snapFin = false;
            self.snapFinFun = null;
        }
    };

    self.onSnapFin = function( fun ) {
        if ( self.snapFin )
            fun.apply();
        else {
            self.snapFinFun = fun;
        }
    };

    self.unsubscribeAndClear = function() {
        self.unsubscribe();
        self.map = {};
        self.clearList();
        self.snapFin = false;
        self.subsId = null;
    };

    self.clearList = function() {
        self.list = [];
    };

    self.getList = function() {
        return self.list;
    };

    // rec =
    self.containsRec = function (searchFun) {
        var l = self.getList();
        for ( i = 0; i < l.length; l++ ) {
            if ( searchFun.apply( null, [l[i]] ) )
                return true;
        }
        return false;
    };

    self.containsKey = function (key) {
        return self.map[key] != null;
    };

    self.removeKey = function(recordKey) {
        var rec = self.map[recordKey];
        if ( rec !== 'undefined') {
            delete self.map[recordKey];
            var length = self.getList().length;
            var x;
            for ( x = 0; x < length; x++) {
                if ( self.getList()[x].recordKey == recordKey ) {
                    self.list.splice(x,1);
                    length--;
                }
            }
        } else {
            console.log('could not find removed rec '+recordKey+" "+self.map[recordKey]);
        }
    };

    self.insertRec = function(rec) {
        self.map[rec.recordKey] = rec;
        if (self.insertFun) {
            var idx = self.insertFun.apply(self, [self.getList(), rec]);
            self.list.splice(idx, 0, rec);
        } else {
            self.list.push(rec);
        }
    };

    self.push = function(change) {
        if (self.preChangeHook) {
            self.preChangeHook.call(null,change,self.snapFin);
        }
        switch ( change.type ) {
            case RL_ADD: {
//                console.log( "add "+change.recordKey);
                var rec = change.newRecord;
                if ( self.map[change.recordKey] ) {
                    console.log('double add rec '+change.recordKey);
                }
                self.insertRec(rec);
            } break;
            case RL_REMOVE: {
//                console.log( "remove "+change.recordKey);
                self.removeKey(change.recordKey);
            } break;
            case RL_SNAPSHOT_DONE:
                self.snapFin = true;
                if ( self.snapFinFun ) {
                    self.snapFinFun.apply();
                    self.snapFinFun = null;
                }
                break;
            case RL_UPDATE: {
                var rec = self.map[change.recordKey];
                if ( rec ) {
                    var changeArray = change.appliedChange.fieldIndex;
                    for ( var i = 0; i < changeArray.length; i++ ) {
                        var fieldId = changeArray[i];
                        var newValue = change.appliedChange.newVal[i];
                        var fieldName = RealLive.getFieldName(change.tableId,fieldId);
                        rec[fieldName] = newValue;
                        //var oldValue = change.appliedChange.oldVal[i];
                        //var error = rec[fieldName] != oldValue;
                    }
                    var postUpdate = self.postUpdate(change, rec);
                    if ( rec !== postUpdate ) {
                        self.map[change.recordKey] = postUpdate;
                        self.list.replace(rec,postUpdate);
                    }
                }
//                console.log(rec);
            } break;
        }
        if (self.postChangeHook) {
            self.postChangeHook.call(null,change,self.snapFin);
        }
    };

    self.postUpdate = function( change, record ) {
        //JSON.parse(JSON.stringify(rec));
        return record;
    };

    self.getChangedFieldNames = function(change) {
        return RealLive.getChangedFieldNames(change);
    };


    if ( table && query ) {
        self.subscribe(table,query);
    }

    self.clearList();
}
