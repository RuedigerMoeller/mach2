
function RegisterController() {
    var self = this;

    self.userExists = ko.observable(false);
    self.user = ko.observable("");
    self.pwd = ko.observable("");
    self.confirmPwd = ko.observable("");
    self.email = ko.observable("");
    self.formError = ko.observable("");

    self.confirmError = ko.computed( function() {
        var un = self.user();
        if ( self.userExists() )
            return "user already exists !";
        if ( self.user().length < 4 ) return "nick name must be at least 4 chars long";
        if ( self.pwd().length < 6 ) return "password must have at least 6 chars";
        if ( self.pwd() != self.confirmPwd() ) return "confirmation password does not match";
        return "";
    }, self);

    self.canSubmit = ko.computed( function() {
        return self.confirmError() == "";
    }, self);

    self.user.subscribe( function() {
        Server.restGET("$userExists/"+self.user()).then( function(r,e) {
            self.userExists(r?true:false);
        })
    });
    self.doRegister = function() {
        Server.restGET("$registerUser/"+self.user()+"/"+self.pwd()+"/"+self.email()).then( function(r,e) {
            if ( r == null ) {
                // fixme: need global message component
                window.location.hash="#home";
            } else {
                self.confirmError("ERROR: User registration failed "+r);
            }
        })
    };

}
