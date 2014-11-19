
// helper binding
ko.bindingHandlers.navdrawer = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var drawer = $(element).find(".drawer");
        var drawerVisible = ko.observable({ drawerVisible: false });
        var height = drawer.height();
        var closeUnderway = false;
        drawer.on(
            {
                mouseenter: function () {
                    drawer.height(height*2);
                    closeUnderway = false;
                    setTimeout( function() {
                        if (!closeUnderway)
                            drawerVisible({ drawerVisible: true });
                    }, 350);
                },
                mouseleave: function () {
                    drawer.height(height);
                    closeUnderway = true;
                    drawerVisible({ drawerVisible: false });
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

function NavBarModel(params) {
    // 'params' is an object whose key/value pairs are the parameters
    // passed from the component binding or custom element.
    this.navs = params.navModel; // [ { title: 'Home',    link:'#home',  enabled: true }, .. ]
    this.currentView = params.currentView; // observable wher currentiew without # is set
    var self = this;

    $(window).on('hashchange', function() {
        console.log("change site:"+window.location.hash.substring(1));
        self.currentView(window.location.hash.substring(1))
    });
}

NavBarModel.prototype.doSomething = function() { };

ko.components.register('navpane-ko', {
    viewModel: {
        createViewModel: function(params, componentInfo) {
            // - 'params' is an object whose key/value pairs are the parameters
            //   passed from the component binding or custom element
            // - 'componentInfo.element' is the element the component is being
            //   injected into. When createViewModel is called, the template has
            //   already been injected into this element, but isn't yet bound.

            // Return the desired view model instance, e.g.:
            return new NavBarModel(params);
        }
    },
    template: { element: "navbar-tpl" }
});
