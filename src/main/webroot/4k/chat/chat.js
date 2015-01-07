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
    self.marketPlaceFilter = null;
    self.userIdFilter = null;

    self.data = new RLObservableResultSet(null, null, function(table, query, cb ) {
        return Server.session().$subscribeMsg( self.marketPlaceFilter, self.userIdFilter, cb );
    });

    Server.doOnceLoggedIn( function() {
        self.data.subscribe("Message", "");
    });

}