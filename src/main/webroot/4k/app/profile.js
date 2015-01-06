
function ProfileController() {
    var self = this;

    // fixme: could be easier using punch lib
    self.user = ko.observable("");
    self.pwd = ko.observable("");
    self.confirmPwd = ko.observable("");
    self.email = ko.observable("");
    self.formError = ko.observable("");
    self.urec = ko.observable(null);

    self.readData = function(usrec) {
        self.user(usrec.name);
        self.pwd(usrec.pwd);
        self.confirmPwd(usrec.pwd);
        self.email(usrec.email);
        self.urec(usrec);
    };

    self.confirmError = ko.computed( function() {
        var un = self.user();
        if ( self.user().length < 4 ) return "nick name must be at least 4 chars long";
        if ( self.pwd().length < 6 ) return "password must have at least 6 chars";
        if ( self.pwd() != self.confirmPwd() ) return "confirmation password does not match";
        return "";
    }, self);

    self.doUpload = function(file,data, errorObservable ) {
        Server.session().$uploadImage("user", file.type, data).then( function(r,e) {
            if ( r === file.size ) {
                errorObservable("upload finished.")
            } else {
                errorObservable("upload error. Reported size:"+r);
                setTimeout( function() {errorObservable("")}, 3000);
            }
        });
    };

    self.canSubmit = ko.computed( function() {
        return self.confirmError() == "";
    }, self);

    self.doSubmit = function() {
    };

}
