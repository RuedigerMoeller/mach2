var user = new RLObservableResultSet();
var tableRS = new RLObservableResultSet();
var assignedMarkets = new RLObservableResultSet();
var availableMarkets = new RLObservableResultSet();
var userMarkets = new RLObservableResultSet();

var model = {};

model.userRecord = ko.observable({ role: ['NONE'] });
model.isMarketAdmin = ko.observable(false);

// navbar menu
model.navs = ko.observableArray([
    { title: 'Home',    link:'#home',  enabled: true },
    { title: 'Trading',   link:'#tables', enabled: Server.loggedIn, subs: [
        { title: 'Markets', link:'#tables', enabled: Server.loggedIn },
        { title: 'Orders & Trades', link:'#own', enabled: Server.loggedIn },
        { title: 'Cash', link:'#cash', enabled: Server.loggedIn }
    ]},
    { title: 'Admin', link:'#admin', enabled: model.isMarketAdmin, subs: [
        { title: 'Users & Invites', link:'#users', enabled: Server.loggedIn },
        { title: 'Assigned Markets', link:'#admin', enabled: Server.loggedIn }
    ]},
    { title: 'Showcase',link:'#show',  enabled: Server.loggedIn }
]);

// testing on home
model.testInstrument = ko.observable("");
model.testMarket = ko.observable("");
model.testClick = function() {
    console.log("testClick");
};


// appwide
model.currentView = ko.observable("home");
model.tables = tableRS.list;
model.userMarkets = userMarkets.list;   // markets available for trading
model.assignedMarkets = assignedMarkets.list;   // markets assigned to an admin
model.availableMarkets = availableMarkets.list; // market templates
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

model.test = ko.observable("pok");

// invitationstuff
model.inviteController = new InviteController();
// admin controller
model.adminController = new MarketsController();
// trade controller (template named tables)
model.tradeController = new TradeController();
// own overview
model.ownController = new OwnController();

model.userString = ko.computed( function() {
    if ( Server.loggedIn() && model.userRecord().role != "NONE" ) {
        var us = model.userRecord();
        return "Welcome <b>"+us.name+"</b>, "+us.role[0];
    }
    return "";
});

model.delOrder = function( row ) {
    Server.session().$delOrder(row).then( function(r,e) {
        if (e)
            console.error("unhandled error "+e);
        if (r) {
            //if ( row.buy ) {
            //    self.buyOrderMsg(r);
            //} else
            //{
            //    self.sellOrderMsg(r);
            //}
        } else {
            //if ( row.buy ) {
            //    self.buyOrderMsg('');
            //} else {
            //    self.sellOrderMsg('');
            //}
        }
    });
};

ko.applyBindings(model);

// init/overwrite formatters in rlgrid
RLFormatterMap["Text15"] = function(meta, fieldName, celldata) {
    if ( celldata.length < 30 )
        return celldata;
    return "<span data-bind='bsttip: \""+celldata+"\"'>" + celldata.substring(0,30)+ " ...</span>";
};
RLFormatterMap["Trader"] = function(meta, fieldName, celldata, row) {
    //return "<img src='img/user/"+celldata+".jpg' width='16' height='16'>&nbsp;<b>"+celldata+"</b>";
    return "<b id='_ns_userLink' class='userLink'>"+celldata+"</b>";
};
RLFormatterMap["Price"] = function(meta, fieldName, celldata, row) {
    if ( row instanceof JOrder ) {
        if ( row.buy ) {
            return "<b id='_ns_matchBuy' class='buyPrice'>"+Number(celldata/100).toFixed(2)+"</b>";
        } else
            return "<b id='_ns_matchSell' class='sellPrice'>"+Number(celldata/100).toFixed(2)+"</b>";
    } else
        return "<b>"+Number(celldata/100).toFixed(2)+"</b>";
},

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
        }
    });
    user.subscribe("User","true");
});

var inviteString = window.location.hash;

// handle links from invitation mail
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
