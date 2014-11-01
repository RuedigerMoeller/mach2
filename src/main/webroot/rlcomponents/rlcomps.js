
var highlightElem = function(element, color) {
    if (!element.hicount && element.hicount != 0) {
        element.hicount = 1;
    } else {
        element.hicount++;
    }
    element.style.backgroundColor = '#FFF3B0';
    if ( color )
        element.style.color = '#000';
    (function () {
        var current = element;
        var prevKey = element;
        setTimeout(function () {
            if (current.hicount <= 1 || prevKey != current) {
                current.style.backgroundColor = 'rgba(230,230,230,0.0)';
                if ( color )
                    current.style.color = color;
                current.hicount = 0;
            } else {
                current.hicount--;
            }
        }, 3000);
    }())
};

ko.bindingHandlers.hilight = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var self = element;
        $(element).bind('DOMSubtreeModified', function(event) {
            if (element.innerHTML != self.lastValue ) {
                var col = valueAccessor();
                if ( col != true ) {
                    highlightElem(element,col);
                } else {
                    highlightElem(element);
                }
                self.lastValue = element.innerHTML;
            }
        });
        self.lastValue = element.innerHTML;
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
};

// <div data-bind='rlrecord: { table: '', key: '' }'
ko.bindingHandlers.rlrecord = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

        var functionsOnUnsubscribe = [];
        var self = this;
        var currentParams = valueAccessor();
        for ( var i = 0; i < functionsOnUnsubscribe.length; i++ ) {
            functionsOnUnsubscribe[i].apply(self);
        }

        var table = currentParams.table;
        if ( ko.isObservable(table) ) {
            table.subscribe(function(newValue) {

            });
            table = currentParams.table();
        }

        var key = currentParams.key;
        if ( ko.isObservable(key) ) {
            key.subscribe(function(newKey) {

            });
            key = currentParams.table();
        }
        var recordObj = ko.observable({recordKey:null});

        Server.doOnceLoggedIn( function() {
            Server.session().$subscribeKey(table, key, function( change,err) {
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
            });
        });

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
    }
};
