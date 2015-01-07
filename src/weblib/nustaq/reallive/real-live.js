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

    this.getChangedFieldNames = function(change) {
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

    this.getTableMeta = function(tableId,columnName) {
        var res = Server.meta().tables[tableId];
        if ( columnName ) {
            return res.columns[columnName];
        }
        return res;
    };

    this.getFieldName = function(tableId,fieldId) {
        if ( this.getTableMeta( tableId) ) {
            return this.getTableMeta(tableId).fieldId2Name[fieldId];
        }
        console.log("unknown table "+tableId+" "+fieldId);
    };

    // compute ordered visible columns
    this.visibleColumns = function( columns ) {
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

    this.enrichModel = function (model) {
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

    this.map = {};
    this.preChangeHook = null;
    this.postChangeHook = null;
    this.snapFin = false;
    this.subsId = null;
    this.subsCB = null;
    this.snapFinFun = null;
    this.insertFun = 0; // function(list,newItem) defining insert point in list.

    // fnFronendquery: filterfunction(record)
    this.subscribe = function( table, query, fnFrontendQuery ) {
        self.unsubscribe();
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
            subscribeFun.apply(null,[table, query, self.subscb]).then(cbProc)
        } else {
            Server.session().$subscribe( table, query, self.subscb ).then(cbProc);
        }
        return this;
    };

    this.query = function( table, query ) {
        self.unsubscribe();
        Server.session().$query( table, query, self.subscb = function(change,e) {
            self.push(change);
        });
    };

    this.unsubscribe = function() {
        if ( self.subsId ) {
            Server.unregisterCB(this.subsCB);
            Server.session().$unsubscribe(self.subsId);
            self.subsId = null;
            self.subsCB = null;
            self.snapFin = false;
            self.snapFinFun = null;
        }
    };

    this.onSnapFin = function( fun ) {
        if ( self.snapFin )
            fun.apply();
        else {
            self.snapFinFun = fun;
        }
    };

    this.unsubscribeAndClear = function() {
        this.unsubscribe();
        this.map = {};
        this.clearList();
        this.snapFin = false;
        this.subsId = null;
    };

    this.clearList = function() {
        this.list = [];
    };

    this.getList = function() {
        return this.list;
    };

    // rec =
    this.containsRec = function (searchFun) {
        var l = this.getList();
        for ( i = 0; i < l.length; l++ ) {
            if ( searchFun.apply( null, [l[i]] ) )
                return true;
        }
        return false;
    };

    this.containsKey = function (key) {
        return self.map[key] != null;
    };

    this.removeKey = function(recordKey) {
        var rec = this.map[recordKey];
        if ( rec !== 'undefined') {
            delete this.map[recordKey];
            var length = this.getList().length;
            var x;
            for ( x = 0; x < length; x++) {
                if ( this.getList()[x].recordKey == recordKey ) {
                    this.list.splice(x,1);
                    length--;
                }
            }
        } else {
            console.log('could not find removed rec '+recordKey+" "+this.map[recordKey]);
        }
    };

    this.push = function(change) {
        if (this.preChangeHook) {
            this.preChangeHook.call(null,change,this.snapFin);
        }
        switch ( change.type ) {
            case RL_ADD: {
//                console.log( "add "+change.recordKey);
                var rec = change.newRecord;
                if ( this.map[change.recordKey] ) {
                    console.log('double add rec '+change.recordKey);
                }
                this.map[rec.recordKey] = rec;
                if ( this.insertFun ) {
                    var idx = this.insertFun.apply(this,[this.getList(),rec]);
                    this.list.splice(idx,0,rec);
                } else {
                    this.list.push(rec);
                }
            } break;
            case RL_REMOVE: {
//                console.log( "remove "+change.recordKey);
                self.removeKey(change.recordKey);
            } break;
            case RL_SNAPSHOT_DONE:
                this.snapFin = true;
                if ( self.snapFinFun ) {
                    self.snapFinFun.apply();
                    self.snapFinFun = null;
                }
                break;
            case RL_UPDATE: {
                var rec = this.map[change.recordKey];
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
        if (this.postChangeHook) {
            this.postChangeHook.call(null,change,this.snapFin);
        }
    };

    this.postUpdate = function( change, record ) {
        //JSON.parse(JSON.stringify(rec));
        return record;
    };

    this.getChangedFieldNames = function(change) {
        return RealLive.getChangedFieldNames(change);
    };


    if ( table && query ) {
        self.subscribe(table,query);
    }

    this.clearList();
}
