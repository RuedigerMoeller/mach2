ko.bindingHandlers.bsttip = {

    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        element.setAttribute('data-content',valueAccessor());
        element.setAttribute('data-placement','right');
        element.setAttribute('data-original-title','');
        element.setAttribute('data-trigger','hover');
        $(element).popover();
    },

    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        element.setAttribute('data-content',valueAccessor());
    }

};
