

// params
// placeHolder
// size
// maxLength
// width
// value
// align
// validate: function | name of function in NSValidators
// inpId - set an id

ko.extenders.editor = function(target, option) {
    target.editor = option;
    return target;
};

var NSValidators = {
    Number: function(cont) {
       return $.isNumeric(cont);
    },
    Int: function(cont) {
        return $.isNumeric(cont) && cont.toString().indexOf('.') < 0;
    }
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
        this.isValid = params.validator;
    }

    if (params.validator && NSValidators[params.validator]) {
        this.isValid = function () {
            if (!self.value)
                return false;
            return NSValidators[params.validator].apply(null, [self.value()]);
        };
    }

    this.bgColor = ko.pureComputed(function () {
        return self.isValid() ? '#fff' : '#FFF3B0';
    });

    this.value.extend( { editor: self } );

}