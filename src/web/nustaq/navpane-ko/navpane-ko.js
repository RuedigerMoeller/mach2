
function NavBarModel(params) {
    var self = this;
    // 'params' is an object whose key/value pairs are the parameters
    // passed from the component binding or custom element.
    this.navs = params.navModel; // [ { title: 'Home',    link:'#home',  enabled: true }, .. ]
    this.hovered = ko.observable(null);
    this.mouseIn = ko.observable(false);

    this.doHover = function( navElem ) {
        self.hovered(navElem);
    };

    this.doUnHover = function( navElem ) {
        //self.hovered(null);
    };

    this.isIn = function( data, event ) {
        self.mouseIn(true);
        return false;
    };

    this.isOut = function( data, event ) {
        self.mouseIn(false);
        return false;
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
