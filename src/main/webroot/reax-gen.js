
var JReaXession = function(obj) {
    this.__typeInfo = 'ReaXession';
    this.receiverKey=obj;
    this._actorProxy = true;


    this.$getId = function() {
        var call = MinBin.obj('call', {
            method: '$getId',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getCreationTime = function() {
        var call = MinBin.obj('call', {
            method: '$getCreationTime',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$stop = function() {
        var call = MinBin.obj('call', {
            method: '$stop',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call);
    };
    this.$close = function() {
        var call = MinBin.obj('call', {
            method: '$close',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call);
    };
    this.$sync = function() {
        var call = MinBin.obj('call', {
            method: '$sync',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getReport = function() {
        var call = MinBin.obj('call', {
            method: '$getReport',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getSubMonitorables = function() {
        var call = MinBin.obj('call', {
            method: '$getSubMonitorables',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };

};


var JReaXerve = function(obj) {
    this.__typeInfo = 'ReaXerve';
    this.receiverKey=obj;
    this._actorProxy = true;


    this.$authenticate = function(user, pwd) {
        var call = MinBin.obj('call', {
            method: '$authenticate',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                user,
                pwd
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getSession = function(id) {
        var call = MinBin.obj('call', {
            method: '$getSession',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                id
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$stop = function() {
        var call = MinBin.obj('call', {
            method: '$stop',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call);
    };
    this.$close = function() {
        var call = MinBin.obj('call', {
            method: '$close',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call);
    };
    this.$sync = function() {
        var call = MinBin.obj('call', {
            method: '$sync',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getReport = function() {
        var call = MinBin.obj('call', {
            method: '$getReport',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getSubMonitorables = function() {
        var call = MinBin.obj('call', {
            method: '$getSubMonitorables',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
    };

};



var mbfactory = function(clzname,jsObjOrRefId) {
    switch (clzname) {
        case 'ReaXession': return new JReaXession(jsObjOrRefId);
        case 'ReaXerve': return new JReaXerve(jsObjOrRefId);
        default: if (!jsObjOrRefId) return { __typeInfo: clzname }; else { jsObjOrRefId.__typeInfo = clzname; return jsObjOrRefId; }
    }
};

MinBin.installFactory(mbfactory);
