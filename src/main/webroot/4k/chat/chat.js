ko.components.register('ns-chat', {
    template:  { element: "chat-tpl" },
    viewModel: {
        createViewModel: function(params,componentInfo) {
            return new NSChatModel(params,componentInfo);
        }
    }
});

function NSChatModel(params, compinfo) {
    var self = this;

    self.msgBox = ko.observable("");
    self.marketPlaceFilter = __(null);
    self.userIdFilter = __(null);
    self.isEditing = ko.observable(false);
    if ( params.assignTo ) { // expect binding
        params.assignTo.apply(null,[self]);
    }

    self.startEdit = function() {
        self.isEditing(true);
    };
    self.stopEdit = function() {
        //setTimeout( function() {self.isEditing(false);}, 500);
    };

    self.keyPressed = function( data, event ) {
        if ( event.keyCode == 13 && self.msgBox().length > 0 ) {
            self.sendMsg();
            return false;
        }
        return true;
    };

    self.prevFilter = null;

    self.updateMarketFilter = function(newFilter) {
        if ( newFilter == '' || ! newFilter ) {
            newFilter = null;
        }
        if ( self.prevFilter != newFilter ) {
            self.marketPlaceFilter(newFilter);
            self.data.subscribe("Message", "");
            self.prevFilter = newFilter;
        }
    };

    self.sendMsg = function(event) {
        var msg = new JMessage({
            marketId: self.marketPlaceFilter(),
            messageText: self.msgBox(),
            senderId: model.userRecord().name,
            userId: null
        });
        Server.session().$sendMessage(msg).then( function(r,e) {
            self.msgBox("");
        });
    };

    self.showElem = function(elem) {
        $(elem).hide().fadeIn(400);
    };
    self.hideElem = function(elem) {
        $(elem).fadeOut(400,function() { $(elem).remove(); });
    };

    self.data = new RLObservableResultSet(null, null, function(table, query, cb ) {
        return Server.session().$subscribeMsg( self.marketPlaceFilter(), self.userIdFilter(), cb );
    });

    self.data.sortBy("msgTimeString", true);

    var recidCount = 1;
    self.postMessage = function (stringMsg, removeTimeout) {
        var now = new Date();
        var rec = {
            recordKey: "local:"+(recidCount++),
            messageText: stringMsg,
            senderId: "local",
            msgTimeString: "@"+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()
        };
        self.data.insertRec(rec);
        if ( removeTimeout ) {
            setTimeout(function() {
                self.data.removeKey(rec.recordKey);
            },removeTimeout);
        }
    };

    Server.doOnceLoggedIn( function() {
        self.data.subscribe("Message", "");
    });

}