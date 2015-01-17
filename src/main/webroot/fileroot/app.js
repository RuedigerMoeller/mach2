var tableRS = new RLObservableResultSet();


var assignedMarkets = new RLObservableResultSet();
var availableMarkets = new RLObservableResultSet();
var userMarkets = new RLObservableResultSet();

var model = { test: ko.observable("POK")};
ko.punches.enableAll();

model.userRecord = ko.observable( new JUser() );
model.userRecord().role = ['NONE'];
model.userRecord().cash = 0;

model.isMarketAdmin = ko.observable(false);

// navbar menu
model.navs = ko.observableArray([
    { title: 'Home',    link:'#home',  enabled: true },
    { title: 'Market', link:'#tables', enabled: Server.loggedIn },
    { title: 'Orders', link:'#own', enabled: Server.loggedIn },
    { title: 'Profile', link:'#profile', enabled: Server.loggedIn },
    { title: 'Users', link:'#users', enabled: model.isMarketAdmin },
    { title: 'MarketPlaces', link:'#admin', enabled: model.isMarketAdmin }
]);

// appwide
model.currentView = ko.observable("home");
model.tables = tableRS.list;
model.userMarkets = userMarkets.list;   // markets available for trading
model.assignedMarkets = assignedMarkets.list;   // markets assigned to an admin
model.availableMarkets = availableMarkets.list; // market templates
model.userName = Server.userName;
// a bit of chaos here: userRec is static, userSubscribe dynamic, userName just string
model.subscribedUser = ko.observable(null);

model.postMessage = function (stringMsg) {
    model.msgBoxController().setMessage(stringMsg);
    model.chatController().postMessage(stringMsg,30000);
};

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
        $(elem).fadeOut(200,function() { $(elem).remove(); });
};
model.isMarketAssigned = function (marketPlaceKey) {
    // fixme: add original Id
    return assignedMarkets.containsKey( marketPlaceKey + '#' + model.userName() );
};

// invitationstuff
model.inviteController = new InviteController();
// admin controller
model.adminController = new MarketsController();
// trade controller (template named tables)
model.tradeController = new TradeController();
// own overview
model.ownController = new OwnController();

model.registerController = new RegisterController();
model.profileController = new ProfileController();
model.chatController = ko.observable(null);
model.msgBoxController = ko.observable(null);

model.onRegister = function() {
    window.location.hash = "register";
};

model.delOrder = function( row ) {
    Server.session().$delOrder(row).then( function(r,e) {
        if (e)
            console.error("unhandled error "+e);
        if (r) {
            model.postMessage(""+r);
        } else {
            if ( e )
                model.postMessage(""+r);
        }
    });
};

ko.applyBindings(model);

// init/overwrite formatters in rlgrid
RLFormatterMap["Text15"] = function(meta, fieldName, celldata) {
    if ( celldata.length < 15 )
        return "<span style='width:150px;'>"+celldata+"</span>";
    return "<span data-bind='bsttip: \""+celldata+"\"'>" + celldata.substring(0,15)+ " ...</span>";
};

RLFormatterMap["Trader"] = function(meta, fieldName, celldata, row) {
    //return "<img src='img/user/"+celldata+".jpg' width='16' height='16'>&nbsp;<b>"+celldata+"</b>";
    return "<b id='_ns_userLink' class='userLink'>"+celldata+"</b>";
};

RLFormatterMap["MarketLink"] = function(meta, fieldName, celldata, row) {
    //return "<img src='img/user/"+celldata+".jpg' width='16' height='16'>&nbsp;<b>"+celldata+"</b>";
    if ( row instanceof JOrder || row instanceof JTrade) {
        if ( celldata.indexOf("#") >= 0 ) {
            celldata = celldata.substring(0,celldata.indexOf("#"));
        }
        return "<b id='_ns_marketLink' class='userLink'>"+celldata+"</b>";
    }
    return celldata;
};

RLFormatterMap["InstrumentLink"] = function(meta, fieldName, celldata, row) {
    //return "<img src='img/user/"+celldata+".jpg' width='16' height='16'>&nbsp;<b>"+celldata+"</b>";
    if ( row instanceof JOrder ) {
        return "<b id='_ns_instrumentLinkFromOrder' class='userLink'>"+celldata+"</b>";
    }
    if ( row instanceof JTrade ) {
        return "<b id='_ns_instrumentLinkFromTrade' class='userLink'>"+celldata+"</b>";
    }
    return celldata;
};

RLFormatterMap["Price"] = function(meta, fieldName, celldata, row) {
    if ( row instanceof JOrder ) {
        if ( row.buy ) {
            return "<b id='_ns_matchBuy' class='buyPrice'>"+Number(celldata/100).toFixed(2)+"</b>";
        } else
            return "<b id='_ns_matchSell' class='sellPrice'>"+Number(celldata/100).toFixed(2)+"</b>";
    } else
        return "<b>"+Number(celldata/100).toFixed(2)+"</b>";
};

RLFormatterMap["BS"] = function(meta, fieldName, celldata, row) {
    if ( row instanceof JTrade ) {
        if ( row.buyTraderKey == model.userRecord().name ) {
            return "<div class='buyBox'>Buy</div>";
        } else
            return "<div class='sellBox'>Sell</div>";
    } else {
        if ( row[fieldName] ) {
            return "<div class='buyBox'>Buy</div>";
        } else
            return "<div class='sellBox'>Sell</div>";
    }
};

RLGlobalActionTarget = function(actionId, row ) {
    if ( actionId == '_ns_marketLink') {
        if ( row.marketKey ) {
            model.showMarket(row.marketKey);
        } else if ( row.marketId ) {
            model.showMarket(row.marketId);
        }
    } else if ( actionId == '_ns_instrumentLinkFromOrder' ) {
        model.showInstrument( row.marketKey, row.instrumentKey );
    } else if ( actionId == '_ns_instrumentLinkFromTrade' ) {
        model.showInstrument( row.marketId, row.instrumentKey );
    }
};

model.markets = ko.observableArray([]);

model.logout = function() {
    localStorage.loginKey = '';
    window.location.reload(true);
};

model.showInstrument = function(marketId, instrumentId) {
    $.each( model.userMarkets(), function(i,mp) {
        if ( mp.recordKey == marketId || mp.recordKey.indexOf(marketId+"#") == 0 ) {
            window.location.hash = "#tables";
            model.tradeController.selectedMP(mp);
            Server.session().$getInstrument(instrumentId).then(function (r, e) {
                model.tradeController.selectedInstr(r);
            });
        }
    });
};

model.showMarket = function(marketId) {
    $.each( model.userMarkets(), function(i,mp) {
        if ( mp.recordKey == marketId || mp.recordKey.indexOf( marketId+"#" ) == 0 ) {
            window.location.hash = "#tables";
            model.tradeController.selectedMP(mp);
            model.tradeController.selectedInstr(null);
            return false;
        }
        return true;
    });
};

// subscribe sets on login
Server.doOnceLoggedIn( function(bool) {
    tableRS.subscribe("SysTable", "true");
    assignedMarkets.subscribe("MarketPlace", "it.admin=='"+Server.userName()+"'").onSnapFin( function() {
        availableMarkets.subscribe("MarketPlace", "it.admin=='admin'", function(record) { return ! model.isMarketAssigned(record.recordKey) } );
    });
    Server.session().$getUser().then( function(userRec,e) {
        if ( userRec ) {
            userMarkets.subscribe("MarketPlace", "it.admin=='"+userRec.adminName+"' || it.admin=='"+userRec.name+"'");
            model.userRecord(userRec);
            model.isMarketAdmin( (userRec.role[0] == 'ADMIN' || userRec.role[0] == 'MARKET_OWNER'));
            model.profileController.readData(model.userRecord()); // FIXME: user record chaos needs cleanup
            Server.session().$subscribeKey( "User", userRec.recordKey, function(change, error) {
                RealLive.applyChangeToObservable(change,model.subscribedUser);
                var user = model.subscribedUser();
                var positions = user.positions;
                model.markets.removeAll();
                for (var property in positions) {
                    if (positions.hasOwnProperty(property)) {
                        model.markets.push({ name: property.substring(0,property.indexOf('#')), risk: positions[property].risk });
                    }
                }
                model.markets.sort(function(x,y) { return x.name > y.name; })
            });
        }
    });
});

{
    function mpUpdate(newValue) {
        var curMarketKey =  model.tradeController.selectedMP();
        if ( curMarketKey )
            curMarketKey = curMarketKey.recordKey;
        if ( ! curMarketKey )
            curMarketKey = null;
        model.chatController().updateMarketFilter( model.currentView() == 'tables' ? curMarketKey : null );
    }

    model.currentView.subscribe( mpUpdate );
    model.tradeController.selectedMP.subscribe( mpUpdate );

}


//
// handle initial links from invitation/registration mail
//
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
} else if ( inviteString.indexOf("register$") >= 0 ) {
    var regID = inviteString.substring("register$".length+1);
    Kontraktor.restGET( '$validateRegistration/'+regID )
        .then( function (r,e) {
            if (r!=null) {
                var waitForLibs = function() {
                    if ( ! Server.loginComponent ) {
                        setTimeout(waitForLibs,500);
                    } else {
                        Server.loginComponent.user(r[0]);
                        Server.loginComponent.pwd(r[1]);
                        Server.loginComponent.login();
                        var waitForUser = function() {
                            if ( ! model.userRecord().name )
                                setTimeout(waitForUser,500);
                            else {
                                window.location.hash="#profile";
                            }
                        };
                        waitForUser();
                    }
                };
                waitForLibs();
            } else {
                window.location.hash="#invalidRegistration";
            }
        }
    );
} else {
    window.location.hash="#home";
}

smoothScroll.init({
    speed: 600, // Integer. How fast to complete the scroll in milliseconds
    easing: 'easeInOutCubic', // Easing pattern to use
    updateURL: false, // Boolean. Whether or not to update the URL with the anchor hash on scroll
    offset: 70 // Integer. How far to offset the scrolling anchor location in pixels
    //callbackBefore: function ( toggle, anchor ) {}, // Function to run before scrolling
    //callbackAfter: function ( toggle, anchor ) {} // Function to run after scrolling
});

