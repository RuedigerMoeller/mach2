var Server; // { facade: [facadeactor], session: [sessionActor], meta: [reallive datamodel] }

var __ = ko.observable;

Server = {
    facade:  ko.observable(null),
    session: ko.observable(null),
    meta:    ko.observable(null),
    loggedIn: ko.observable(false),
    userName: ko.observable(null),
    loginComponent: null,

    restGET: function(url) {
        return Kontraktor.restGET(url)
    },
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
            Server.loginComponent = self;
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
                        if (localStorage.loginKey && localStorage.loginKey != "") {
                            self.user("");
                            localStorage.loginKey = "";
                        }
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
                                    if ( self.user().length == 32 ) {
                                        self.user( localStorage.uname );
                                    }
                                    if ( Server.session().$getCookieID ) {
                                        Server.session().$getCookieID().then( function(cookie,e) {
                                            localStorage.loginKey = cookie;
                                            localStorage.uname = self.user();
                                        });
                                    }
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

            // autologin
            if ( localStorage.loginKey &&
                 localStorage.loginKey != "" &&
                 localStorage.uname &&
                 localStorage.uname.length != 32 &&
                 localStorage.uname != "null"
            )
            {
                setTimeout( function() {
                    self.user(localStorage.loginKey);
                    self.login();
                }, 1 );
            }
        },
        template: { element: 'login-template'}
    }
);

////////// requires spin.js //////////////////////////////
ko.bindingHandlers.spin = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        this.spinner = new Spinner( { radius: 3, length: 5, width:2 } );
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

var highlightElem = function(element, textColor) {
    if (!element.hicount && element.hicount != 0) {
        element.hicount = 1;
    } else {
        element.hicount++;
    }
    if ( ! element.hasOwnProperty("__oldBG") ) {
        var oldBG = element.style.backgroundColor;
        if ( oldBG || oldBG == "" )
            element.__oldBG = oldBG;
        else
            return; // not visible ?
    }
    element.style.transition = 'all .3s';
    element.style.backgroundColor = '#FFF3B0';
    if ( textColor )
        element.style.color = '#000';
    (function () {
        var current = element;
        var prevKey = element;
        setTimeout(function () {
            if (current.hicount <= 1 || prevKey != current) {
                element.style.transition = 'all 1s';
                current.style.backgroundColor = current.__oldBG;
                if ( textColor )
                    current.style.color = textColor;
                current.hicount = 0;
            } else {
                current.hicount--;
            }
        }, 2000);
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

ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};
