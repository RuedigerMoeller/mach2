var initinvite = function() {
};

function InviteController() {
    var self = this;

    self.invitedBy = ko.observable(null); // Invite
    self.inviteId = ko.observable("");
    self.inviteUserExists = ko.observable(false);
    self.inviteUser = ko.observable("");
    self.invitePwd = ko.observable("");
    self.invitePwdConfirm = ko.observable("");

    self.canConfirmInviteError = ko.computed( function() {
        var un = self.inviteUser();
        if ( ! /^[\x32-\x7F]*$/.test(un) || un.indexOf('#') >= 0 || un.indexOf('_') >= 0)
            return "user name must not contain special chars.";
        if ( self.inviteUserExists() )
            return "user already exists !";
        if ( self.inviteUser().length < 4 ) return "nick name must be at least 4 chars long";
        if ( self.invitePwd().length < 6 ) return "password must have at least 6 chars";
        if ( self.invitePwd() != self.invitePwdConfirm() ) return "confirmation password does not match";
        return "";
    }, self);

    self.canConfirmInvite = ko.computed( function() {
        return self.canConfirmInviteError() == "";
    }, self);

    self.inviteUser.subscribe( function() {
        Server.restGET("$userExists/"+self.inviteUser()).then( function(r,e) {
            self.inviteUserExists(r?true:false);
        })
    });
    self.acceptInvite = function() {
        Server.restGET("$createUserFromInvite/"+self.inviteId()+"/"+self.inviteUser()+"/"+self.invitePwd()).then( function(r,e) {
            if ( r == null ) {
                Server.loginComponent.user(self.inviteUser());
                Server.loginComponent.pwd(self.invitePwd());
                Server.loginComponent.login();
                window.location.hash="#home";
            } else {
                // fixme: internal error. Need msgbox component
                console.log("User creationg failed "+r);
            }
        })
    };

}
