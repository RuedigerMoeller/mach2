

// params
// placeHolder
// size
// maxLength
// width
// value
// align
// validate: function | name of function in NSValidators
// inpId - set an id

if ( window.ns ) {
    window.ns.validators = {};
} else {
    window.ns = { validators: {} };
}

ns.invalidColor = '#FFFFCC';

ko.extenders.editor = function(target, option) {
    target.editor = option;
    target.errorMsg = null;
    return target;
};

ns.validators.string = function(maxlen, minlen, regex) {
    return function(cont) {
        if ( maxlen && cont.length > maxlen )
            return false;
        if ( minlen && cont.length < minlen )
            return false;
        if ( regex && ! regex.test(cont) )
            return false;
        return true;
    };
};

ns.validators.charstring = function(maxlen, minlen) {
    return ns.validators.string(maxlen,minlen,/^[a-zA-Z]*$/);
};

ns.validators.charnumstring = function(maxlen, minlen) {
    return ns.validators.string(maxlen,minlen,/^[a-zA-Z0-9]*$/);
};

ns.validators.number = function(min,max) {
    return function(cont) {
        if (! $.isNumeric(cont) )
            return false;
        var f = parseFloat(cont);
        if ( min && f < min )
            return false;
        if ( max && f > max ) {
            return false;
        }
        return true;
    };
};

ns.validators.int = function(min,max) {
    return function(cont) {
        if (! $.isNumeric(cont) )
            return false;
        var f = parseInt(cont);
        if ( min && f < min )
            return false;
        if ( max && f > max ) {
            return false;
        }
        if ( (""+cont).indexOf('.') >= 0 )
            return false;
        return true;
    };
};

ko.components.register('ns-input', {
    template:  { element: "input-tpl" },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new InputModel(params,componentInfo);
        }
    }
});

function InputModel(params, compInfo) {
    var self = this;
    this.placeHolder = ko.observable(params.placeHolder ? params.placeHolder : '');
    this.size = ko.observable(params.size ? params.size : '10');
    this.maxLength = ko.observable(params.maxLength ? params.maxLength : '100');
    this.inpId = params.inpId ? params.inpId : null;
    this.value = params.value ? params.value : ko.observable('-');
    this.width = params.width ? params.width : '';
    this.align = params.align ? params.align : 'left';

    this.isValid = ko.pureComputed(function () {
        return true; //self.value() && self.value().length > 0;
    });

    if ($.isFunction(params.validator)) {
        this.isValid = function () {
            return params.validator.apply(self, [self.value()]);
        };
    } else if ( params.validator ) {
        console.error('validator should be a function');
    }

    this.bgColor = ko.pureComputed(function () {
        return self.isValid() ? '#fff' : ns.invalidColor;
    });
    this.value.extend( { editor: self } );
}

ko.bindingHandlers.dependsOn = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var arrObs = valueAccessor(); // [ of observable]
        var enabled = ko.pureComputed(function() {
            var res = true;
            $.each(arrObs, function(i,obs) {
                var val = obs();
                if ( obs.editor && ! obs.editor.isValid() ) {
                    res = false;
                    return false;
                }
                if ( ! obs.editor && ! val )
                    return false;
                return true;
            });
            return res;
        });
        enabled.subscribe(function(value) {
            if (value && element.disabled)
                element.removeAttribute("disabled");
            else if ((!value) && (!element.disabled))
                element.disabled = true;
        });
        setTimeout(function() {
            if (arrObs.length>0) {
                arrObs[0].valueHasMutated();
            }
        },50);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
};
