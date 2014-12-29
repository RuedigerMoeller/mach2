/**
 * Created by ruedi on 29.10.14.
 */

var inittables = function() {
};

function TradeController() {
    var self = this;

    self.selectedMP = ko.observable({ recordKey: '' }); // currently selected marketPlace

    self.onMarketPlaceSelection = function(selectedRow) {
        console.log("TradeController MP change");
        if ( selectedRow ) {
            self.selectedMP(selectedRow)
        } else {
            self.selectedMP({ recordKey: '' })
        }
    };

}


