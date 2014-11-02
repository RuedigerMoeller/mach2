var Server; // { facade: [facadeactor], session: [sessionActor], meta: [reallive datamodel] }
if ( typeof ko !== 'undefined') {

    Server = {
        facade:  ko.observable(null),
        session: ko.observable(null),
        meta:    ko.observable(null),
        loggedIn: ko.observable(false),
        userName: ko.observable(null),

        doOnceLoggedIn: function (fun) {
            if ( Server.loggedIn() ) {
                fun.apply();
            } else {
                var subs = Server.loggedIn.subscribe( function(lgin) {
                    if ( lgin ) {
                        subs.dispose();
                        fun.apply();
                    }
                });
            }
        },
        unregisterCB: function( cb ) {
            Kontraktor.unregisterCB(cb);
        }
    };

    ko.components.register( 'kr-login', {
            viewModel:
            function (params) {
                var self = this;
                this.user = ko.observable('');
                this.pwd = ko.observable('');
                this.resultMsg = ko.observable('');
                this.doSpin = ko.observable(false);
                this.facadeClass = params.facade;   // required
                this.loggedIn = Server.loggedIn;

                this.loginDone = function () {
                    self.resultMsg('');
                    Server.userName(self.user());
                    Server.loggedIn(true);
                    self.doSpin(false);
                };
                // expect $authenticate(), FIXME: define webfacade iface
                this.login = function () {
                    self.resultMsg('');
                    self.doSpin(true);
                    Kontraktor.restGET('$authenticate/'+self.user()+'/'+self.pwd()).then( function(r,e) {
                        if ( e ) {
                            self.doSpin(false);
                            self.resultMsg(e);
                        } else {
                            Kontraktor.connectHome( function() {
                                var facadeClz = window[self.facadeClass];
                                Server.facade(new facadeClz(1));
                                Server.facade().$getSession(r).then( function(r,e) {
                                    if ( e ) {
                                        self.doSpin(false);
                                        self.resultMsg(e);
                                    } else if (r==null) {
                                        self.doSpin(false);
                                        self.resultMsg('unable to create session');
                                    } else {
                                        Server.session(r);
                                        if (typeof RealLive !== 'undefined') { // load model
                                            Server.session().$getRLMeta().then( function(model,err) {
                                                if ( err ) {
                                                    self.doSpin(false);
                                                    self.resultMsg(err);
                                                } else {
                                                    RealLive.enrichModel(model);
                                                    Server.meta(model);
                                                    self.loginDone();
                                                }
                                            });
                                        } else
                                            self.loginDone();
                                    }
                                });
                            })
                        }
                    });
                }.bind(this);
            },
            template: { element: 'login-template'}
        }
    );

    ////////// requires spin.js //////////////////////////////
    ko.bindingHandlers.spin = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            this.spinner = new Spinner();
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            if ( valueAccessor() ) {
                this.spinner.spin(element);
                element.style.opacity = 0.5;
            } else {
                element.style.opacity = 1;
                this.spinner.stop();
            }
        }
    };
}

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
