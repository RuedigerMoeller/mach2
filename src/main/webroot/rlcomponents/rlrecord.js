
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

// <div data-bind='rlrecord: { table: '', recordId: '' }'
ko.bindingHandlers.rlrecord = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // Make a modified binding context, with a extra properties, and apply it to descendant elements
        var childBindingContext = bindingContext.createChildContext(
            { test: 'Hallo'},
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
