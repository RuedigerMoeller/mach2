var initadmin = function() {
};

function MarketsController() {
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
            if ( r )
                model.postMessage(""+r);
            if ( e )
                model.postMessage(""+e);
            self.emailList("");
        });
    };

    self.emailList = ko.observable('');
    self.selectedMP = ko.observable({ recordKey: '' }); // currently selected marketPlace in MP table
    self.selectedMPTemplate = ko.observable(null);      // currently selected template(s) from Template table
}


