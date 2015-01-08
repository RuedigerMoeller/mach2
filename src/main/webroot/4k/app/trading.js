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

    self.formatOrder = function(meta, fieldName, celldata, row) {
        if ( fieldName === 'limitPrice' ) {
            if ( row.buy ) {
                return "<b id='_ns_matchBuy' class='buyPrice-link'>"+Number(celldata/100).toFixed(2)+"</b>";
            } else
                return "<b id='_ns_matchSell' class='sellPrice-link'>"+Number(celldata/100).toFixed(2)+"</b>";
        }
        return null;
    };

    self.tableSelected = function( instr ) {
        self.selectedInstr(instr);
    };

    self.onMarketPlaceSelection = function(selectedRow) {
        console.log("TradeController MP change");
        if ( selectedRow ) {
            self.selectedMP(selectedRow)
        } else {
            self.selectedMP({ recordKey: '' })
        }
        self.selectedInstr(null);
    };

    self.buyActions = function(tablename, order) {
        if ( order.traderKey === model.userRecord().recordKey ) {
            return "<span id='_ns_delOrder' style='cursor: pointer;'>&#10006;</span></td>";
        }
        return '';
    };

    self.goBack = function() {
        self.selectedInstr(null);
    };

    self.onTableAction = function(action,row) {
        console.log("tableaction "+action+" "+row);
        if ( action === '_ns_delOrder' ) {
            model.delOrder(row);
            return true;
        } else if ( action === '_ns_matchBuy') {
            self.sellPrc(row.limitPrice/100);
            self.sellQty(row.qty);
            return true;
        } else if ( action === '_ns_matchSell' ) {
            self.buyPrc(row.limitPrice/100);
            self.buyQty(row.qty);
            return true;
        }
        return false;
    };

    self.doBuy = function() {
        var instr = self.selectedInstr();
        var buyQ = self.buyQty();
        var buyPrc = parseFloat(self.buyPrc());
        Server.session().$addOrder(
            instr.marketPlace,
            instr.recordKey,
            instr.name,
            true,
            buyPrc*100,
            buyQ,
            self.buyText()
        ).then( function(r,e) {
            if ( r ) {
                model.postMessage(""+r);
            } else {
                if ( e )
                    model.postMessage(""+e);
                else
                    model.postMessage( "you added a buy order "+buyQ+"@"+buyPrc.toFixed(2)+" for '"+instr.name+"'" );
                self.buyPrc("");
                self.buyText('');
            }
        });
    };

    self.doSell = function() {
        var sellPrc = parseFloat(self.sellPrc());
        var sellQ = self.sellQty();
        var instr = self.selectedInstr();
        Server.session().$addOrder(
            instr.marketPlace,
            instr.recordKey,
            instr.name,
            false,
            sellPrc*100,
            sellQ,
            self.sellText()
        ).then( function(r,e) {
                if ( e )
                    model.postMessage(""+e);
                else
                    model.postMessage( "you added a sell order "+sellQ+"@"+sellPrc.toFixed(2)+" for '"+instr.name+"'" );
                self.sellPrc("");
                self.sellText('');
            });
    };
}


