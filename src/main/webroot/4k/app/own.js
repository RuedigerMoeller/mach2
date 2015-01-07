var initown = function() {
    if ( model.ownController.firstTime !== true ) {
        model.ownController.doTrades();
        model.ownController.firstTime = true;
    }
};

function OwnController() {
    var self = this;

    self.base = function() {
        return "(it.buyTraderKey=='" + model.userRecord().recordKey + "' || it.sellTraderKey=='" + model.userRecord().recordKey + "')";
    };
    self.tfInstrument = ko.observable("");
    self.tfMarket = ko.observable("");
    self.tfDate = ko.observable("");
    self.tradeFilter = ko.observable(null);

    self.orderActions = function(tablename, order) {
        if ( order.traderKey === model.userRecord().recordKey ) {
            return "<span id='_ns_delOrder' style='cursor: pointer;'>&#10006;</span></td>";
        }
        return '';
    };

    self.onTableAction = function(action,row) {
        if ( action === '_ns_delOrder' ) {
            model.delOrder(row);
            return true;
        }
        return false;
    };

    self.doTrades = function () {
        var base = self.base();
        if (self.tfInstrument().length > 0) {
            base += "&& it.instrumentName.indexOf('"+self.tfInstrument()+"') >= 0";
        }
        if (self.tfMarket().length > 0) {
            base += "&& it.marketName.indexOf('"+self.tfMarket()+"') >= 0";
        }
        if (self.tfDate().length > 0) {
            base += "&& it.tradeTime.indexOf('"+self.tfDate()+"') >= 0";
        }
        self.tradeFilter(base);
    };

}
