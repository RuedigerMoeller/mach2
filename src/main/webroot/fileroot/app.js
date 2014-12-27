function AdminController() {
    var self = this;

    self.addMarketPlace = function(mp) {
        console.log('marketplace added:'+mp);
        Server.session().$instantiateMarketPlace(mp.recordKey).then(function(r,e) {
            console.log("instantiated "+[r,e]);
        });
        availableMarkets.removeKey(mp.recordKey);
    };
    self.onMarketPlaceSelection = function(selectedRow,index) {
        console.log("adminController MP change");
        if ( selectedRow ) {
            self.selectedMP(selectedRow)
        } else {
            self.selectedMP({ recordKey: '' })
        }
    };

    self.onInvite = function() {
        console.log("Invite:"+self.emailList() );
        Server.session().$sendMails(self.emailList()).then( function(r,e) {
            console.log("result:"+r); // FIXME: Errors
            self.emailList("");
        });
    };

    self.emailList = ko.observable('');
    self.selectedMP = ko.observable({ recordKey: '' }); // currently selected marketPlace in MP table
    self.selectedMPTemplate = ko.observable(null);      // currently selected template(s) from Template table
}

function InviteController() {
    var self = this;

    self.invitedBy = ko.observable(null); // Invite
    self.inviteId = ko.observable("");
    self.inviteUserExists = ko.observable(false);
    self.inviteUser = ko.observable("");
    self.invitePwd = ko.observable("");
    self.invitePwdConfirm = ko.observable("");

    self.canConfirmInviteError = ko.computed( function() {
        var un = self.inviteUser();
        if ( ! /^[\x32-\x7F]*$/.test(un) || un.indexOf('#') >= 0 || un.indexOf('_') >= 0)
            return "user name must not contain special chars.";
        if ( self.inviteUserExists() )
            return "user already exists !";
        if ( self.inviteUser().length < 4 ) return "nick name must be at least 4 chars long";
        if ( self.invitePwd().length < 6 ) return "password must have at least 6 chars";
        if ( self.invitePwd() != self.invitePwdConfirm() ) return "confirmation password does not match";
        return "";
    }, self);

    self.canConfirmInvite = ko.computed( function() {
        return self.canConfirmInviteError() == "";
    }, self);

    self.inviteUser.subscribe( function() {
        Server.restGET("$userExists/"+self.inviteUser()).then( function(r,e) {
            self.inviteUserExists(r?true:false);
        })
    });
    self.acceptInvite = function() {
        Server.restGET("$createUserFromInvite/"+self.inviteId()+"/"+self.inviteUser()+"/"+self.invitePwd()).then( function(r,e) {
            if ( r == null ) {
                Server.loginComponent.user(self.inviteUser());
                Server.loginComponent.pwd(self.invitePwd());
                Server.loginComponent.login();
                window.location.hash="#home";
            } else {
                // fixme: internal error. Need msgbox component
                console.log("User creationg failed "+r);
            }
        })
    };

}

var user = new RLObservableResultSet();
var tableRS = new RLObservableResultSet();
var assignedMarkets = new RLObservableResultSet();
var availableMarkets = new RLObservableResultSet();

var model = {};

model.userRecord = ko.observable({ role: ['NONE'] });
model.isMarketAdmin = ko.observable(false);

// navbar menu
model.navs = ko.observableArray([
    { title: 'Home',    link:'#home',  enabled: true },
    { title: 'Trade',  link:'#tables', enabled: Server.loggedIn },
    { title: 'Markets',   link:'#admin', enabled: model.isMarketAdmin },
    { title: 'Users',   link:'#users', enabled: model.isMarketAdmin },
    { title: 'Showcase',link:'#show',  enabled: Server.loggedIn },
]);

// appwide
model.currentView = ko.observable("home");
model.tables = tableRS.list;
model.assignedMarkets = assignedMarkets.list;
model.availableMarkets = availableMarkets.list;
model.userName = Server.userName;
model.userList = user.list;

model.initView = function() {
    if ( window[ 'init'+model.currentView() ] )
        window[ 'init'+model.currentView() ].apply();
};
model.showElem = function(elem) {
    if (elem.nodeType === 1)
        $(elem).hide().fadeIn(200);
};
model.hideElem = function(elem) {
    if (elem.nodeType === 1)
        $(elem).fadeOut(200,function() { $(elem).remove();
        });
};
model.isMarketAssigned = function (marketPlaceKey) {
    // fixme: add original Id
    return assignedMarkets.containsKey( marketPlaceKey + '#' + model.userName() );
};


// invitationstuff FIXME: use own controller
model.inviteController = new InviteController();
// admin controller
model.adminController = new AdminController();



ko.applyBindings(model);

// subscribe sets on login
Server.doOnceLoggedIn( function(bool) {
    tableRS.subscribe("SysTable", "true");
    assignedMarkets.subscribe("MarketPlace", "it.admin=='"+Server.userName()+"'").onSnapFin( function() {
        availableMarkets.subscribe("MarketPlace", "it.admin=='admin'", function(record) { return ! model.isMarketAssigned(record.recordKey) } );
    });
    Server.session().$getUser().then( function(r,e) {
        if ( r ) {
            model.userRecord(r);
            model.isMarketAdmin( (r.role[0] == 'ADMIN' || r.role[0] == 'MARKET_OWNER'));
        }
    });
    user.subscribe("User","true");
});

var inviteString = window.location.hash;
if ( inviteString.indexOf("invite$") >= 0 ) {
    model.inviteController.inviteId(inviteString.substring("invite$".length+1));
    Kontraktor.restGET('$isInviteValid/'+model.inviteController.inviteId())
        .then( function (r,e) {
            if (r!=null) {
                model.inviteController.invitedBy(r);
                var email = r.email;
                if ( email && email.indexOf("@") > 0 )
                    model.inviteController.inviteUser(email.substring(0,email.indexOf('@')));
                window.location.hash="#invite";
            } else {
                window.location.hash="#invalidInvite";
            }
        }
    );
} else {
    window.location.hash="#home";
}
