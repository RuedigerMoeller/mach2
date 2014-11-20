
//ko.bindingHandlers.scrollme = {
//    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
//        element.style = 'height:'+valueAccessor()+'px;border:1px solid #ccc; overflow:auto;';
//    }
//};

// <div data-bind='rlrecord: { table: '', key: '' }'
ko.bindingHandlers.rlrecord = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var callback = null;
        var functionsOnUnsubscribe = [];
        var self = this;
        var currentParams = valueAccessor();

        var disposal = function() {
            for (var i = 0; i < functionsOnUnsubscribe.length; i++) {
                functionsOnUnsubscribe[i].apply(self);
            }
            disposal.length = 0;
        };

        disposal.apply();

        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            console.log("disposal of rlrecord called");
            disposal.apply();
        });

        var subscribeFun;

        var table = currentParams.table;
        if ( ko.isObservable(table) ) {
            table.subscribe(function(newValue) {
                table = currentParams.table();
            });
            table = currentParams.table();
        }

        var key = currentParams.key;
        if ( ko.isObservable(key) ) {
            key.subscribe(function(newKey) {
                key = currentParams.key();
                disposal.apply();
                subscribeFun.apply();
                console.log("KEY CHANGED: "+table+" "+key);
            });
            key = currentParams.key();
        }
        var recordObj = ko.observable({recordKey:null});

        subscribeFun = function() { Server.doOnceLoggedIn( function() {
            Server.session().$subscribeKey(table, key, callback = function( change,err) {
                switch (change.type) {
                    case RL_ADD:
                    {
                        recordObj(change.newRecord);
                    }
                    break;
                    case RL_REMOVE:
                    {
                        recordObj(null);
                    }
                    break;
                    case RL_SNAPSHOT_DONE:
                        //$scope.snapFin = true;
                        break;
                    case RL_UPDATE:
                    {
                        var rec = recordObj();
                        if (rec) {
                            var changeArray = change.appliedChange.fieldIndex;
                            for (var i = 0; i < changeArray.length; i++) {
                                var fieldId = changeArray[i];
                                var newValue = change.appliedChange.newVal[i];
                                var fieldName = RealLive.getFieldName(change.tableId, fieldId);
                                rec[fieldName] = newValue;
                            }
                            recordObj( JSON.parse(JSON.stringify(rec)) );
                        }
                    }
                    break;
                }
            }).then( function(skey, e) {
                functionsOnUnsubscribe.push(function() {
                    Server.session().$unsubscribe(skey);
                    Server.unregisterCB(callback);
                    // FIXME: unsubscribe needed
//                    if ( ko.isObservable(currentParams.table))
//                        currentParams.table.dispose();
//                    if ( ko.isObservable(currentParams.key) )
//                        currentParams.key.dispose();
                });
            });
        })};

        subscribeFun.apply();

        // Make a modified binding context, with a extra properties, and apply it to descendant elements
        var childBindingContext = bindingContext.createChildContext(
            ko.observable(recordObj),
            null, // Optionally, pass a string here as an alias for the data item in descendant contexts
            function(context) {
                ko.utils.extend(context, valueAccessor());
            });
        ko.applyBindingsToDescendants(childBindingContext, element);

        // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
        return { controlsDescendantBindings: true };
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        console.log("rlrecord update"+valueAccessor());
    }
};

function RLObservableResultSet(table,query) {
    RLResultSet.call(this);
    this.list = ko.observableArray();
    this.clearList = function() {
        this.list.splice(0,this.getList().length);
    };
    this.getList = function () {
        return this.list();
    };

    this.postUpdate = function( change, record ) {
        return record;
        //return JSON.parse(JSON.stringify(record));
    };

    this.sortBy = function( column ) {
        this.insertFun = function( list, record ) {
            var len = list.length;
            for ( var i = 0; i < len; i++ ) {
                if ( list[i][column] > record[column] ) {
                    return i;
                }
            }
            return len;
        };
        return this;
    };
    if ( table && query )
        this.subscribe(table,query);
}
RLObservableResultSet.prototype = new RLResultSet();



