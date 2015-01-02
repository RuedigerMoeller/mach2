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
    self.buyOrderMsg = ko.observable("");
    self.sellOrderMsg = ko.observable("");
    self.buyText = ko.observable("");
    self.sellText = ko.observable("");

    self.sellValid = ko.pureComputed(function() {
        return true;
    });

    self.buyValid = ko.pureComputed(function() {
        self.buyPrc();
        self.buyQty();
        if ( !self.buyPrc.editor || !self.buyQty.editor )
            return false;
        return self.buyPrc.editor.isValid() && self.buyQty.editor.isValid();
    });

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

    self.buyActions = function(tablename, order) {
        if ( order.traderKey === model.userRecord().recordKey ) {
            return "<span id='_ns_delOrder' style='cursor: pointer;'>&#10006;</span></td>";
        }
        return '';
    };

    self.onTableAction = function(action,row) {
        console.log("tableaction "+action+" "+row);
        if ( action === '_ns_delOrder' ) {
            Server.session().$delOrder(row).then( function(r,e) {
                if (e)
                    console.error("unhandled error "+e);
                if (r) {
                    if ( row.buy ) {
                        self.buyOrderMsg(r);
                    } else
                    {
                        self.sellOrderMsg(r);
                    }
                } else {
                    if ( row.buy ) {
                        self.buyOrderMsg('');
                    } else {
                        self.sellOrderMsg('');
                    }
                }
            });
            return true;
        }
        return false;
    };

    self.doBuy = function() {
        Server.session().$addOrder(
            self.selectedInstr().recordKey,
            self.selectedInstr().name,
            true,
            self.buyPrc()*100,
            self.buyQty(),
            self.buyText()
        ).then( function(r,e) {
            if ( r ) {
                self.buyOrderMsg(r);
            } else {
                self.buyPrc("");
                self.buyOrderMsg("");
                self.buyText('');
            }
        });
    };

    self.doSell = function() {
        Server.session().$addOrder(
            self.selectedInstr().recordKey,
            self.selectedInstr().name,
            false,
            self.sellPrc()*100,
            self.sellQty(),
            self.sellText()
        ).then( function(r,e) {
                if ( r ) {
                    self.sellOrderMsg(r);
                } else {
                    self.sellPrc("");
                    self.sellOrderMsg("");
                    self.sellText('');
                }
            });
    };
}


