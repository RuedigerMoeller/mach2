/**
 * Created by ruedi on 29.10.14.
 */

var inittables = function() {
};

function TradeController() {
    var self = this;

    self.selectedMP = ko.observable({ recordKey: '' }); // currently selected marketPlace
    self.selectedInstr = ko.observable( null );
    self.buyPrc = ko.observable(null);
    self.sellPrc = ko.observable(null);
    self.buyQty = ko.observable(1);
    self.sellQty = ko.observable(1);

    self.subscription = ko.pureComputed( function() {
        if ( self.selectedInstr() == null )
            return  "it.marketPlace== '"+ self.selectedMP().recordKey+"'";
        else
            return  "it.recordKey== '"+ self.selectedInstr().recordKey+"'";
    });

    self.instrSubscription = ko.pureComputed( function() {
        if ( self.selectedInstr() == null )
            return  "false";
        else
            return  "it.recordKey== '"+ self.selectedInstr().recordKey+"'";
    });

    self.orderBuySubscription = ko.pureComputed( function() {
        if ( self.selectedInstr() == null )
            return  "false";
        else
            return  "it.instrumentKey == '"+ self.selectedInstr().recordKey+"' && it.buy";
    });

    self.orderSellSubscription = ko.pureComputed( function() {
        if ( self.selectedInstr() == null )
            return  "false";
        else
            return  "it.instrumentKey == '"+ self.selectedInstr().recordKey+"' && !it.buy";
    });

    self.tableSelected = function( instr ) {
        self.selectedInstr(instr);
    };

    self.onMarketPlaceSelection = function(selectedRow) {
        console.log("TradeController MP change");
        self.selectedInstr(null);
        if ( selectedRow ) {
            self.selectedMP(selectedRow)
        } else {
            self.selectedMP({ recordKey: '' })
        }
    };

}


