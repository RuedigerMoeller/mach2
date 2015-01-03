
// helper binding
ko.bindingHandlers.navdrawer = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var drawer = $(element).find(".drawer");
        var drawerVisible = ko.observable({ drawerVisible: false });
        var height = 34; // drawer.height();
        var closeUnderway = false;
        drawer.on(
            {
                mouseenter: function () {
                    drawer.height(height+24);
                    closeUnderway = false;
                    setTimeout( function() {
                        if (!closeUnderway)
                            drawerVisible({ drawerVisible: true });
                    }, 350);
                },
                mouseleave: function () {
                    if ( Server.loggedIn() ) {
                        drawer.height(height);
                        closeUnderway = true;
                        drawerVisible({ drawerVisible: false });
                    }
                    var recheck = function() {
                        if ( Server.loggedIn() ) {
                            drawer.height(height);
                            closeUnderway = true;
                            drawerVisible({ drawerVisible: false });
                        } else {
                            setTimeout( recheck, 1000 );
                        }
                    };
                    if ( ! Server.loggedIn() )
                        setTimeout( recheck, 1000 );
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
    var self = this;
    // 'params' is an object whose key/value pairs are the parameters
    // passed from the component binding or custom element.
    this.navs = params.navModel; // [ { title: 'Home',    link:'#home',  enabled: true }, .. ]
    this.hovered = ko.observable(null);

    this.doHover = function( navElem ) {
        self.hovered(navElem);
    };

    this.doUnHover = function( navElem ) {
        //self.hovered(null);
    };

    this.activeNavs = ko.pureComputed( function() {
        var res = [null,null];
        $.each(self.navs(), function (i,top) {
            if ( top.link === '#'+self.currentView() ) {
                res[0] = top;
            }
            if ( top.subs && top.subs.length > 0 ) {
                $.each(top.subs, function (i,sub) {
                    if ( sub.link === '#'+self.currentView() ) {
                        res[0] = top;
                        res[1] = sub;
                    }
                    return true;
                });
            }
            return true;
        });
        console.log("active"+JSON.stringify(res));
        return res;
    });

    self.subMenu = ko.pureComputed( function() {
        if ( self.hovered() )
            return self.hovered();
        return self.activeNavs()[1];
    });

    this.currentView = params.currentView; // observable wher currentiew without # is set

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
