ko.bindingHandlers.navdrawer = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var drawer = $(element).find(".drawer");
        var drawerVisible = ko.observable({ loginVisible: false });
        drawer.on(
            {
                mouseenter: function () {
                    drawer.width(200);
                    setTimeout( function() {drawerVisible({ loginVisible: true });}, 350)
                },
                mouseleave: function () {
                    drawer.width(50);
                    drawerVisible({ loginVisible: false });
                }
            });

        // Make a modified binding context, with a extra properties, and apply it to descendant elements
        var childBindingContext = bindingContext.extend(drawerVisible);
        ko.applyBindingsToDescendants(childBindingContext, element);

        // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
        return { controlsDescendantBindings: true };
//        return { controlsDescendantBindings: false };
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        console.log("navdrawer update"+valueAccessor());
    }
};
