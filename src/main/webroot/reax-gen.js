
var JTestRecord = function(obj) {
    this.__typeInfo = 'TestRecord';

    this.j_version = function() { return MinBin.parseIntOrNan(this.version, 'int' ); };
    this.j_x = function() { return MinBin.parseIntOrNan(this.x, 'int' ); };
    this.j_y = function() { return MinBin.parseIntOrNan(this.y, 'int' ); };
    this.j_z = function() { return MinBin.parseIntOrNan(this.z, 'int' ); };
    this.j_name = function() { return this.name; };
    this.j_other = function() { return this.other; };
    this.j_recordKey = function() { return this.recordKey; };


    this.fromObj = function(obj) {
        for ( var key in obj ) {
            var setter = 'j_'.concat(key);
            if ( this.hasOwnProperty(setter) ) {
                this[key] = obj[key];
            }
        }
        return this;
    };
    if ( obj != null ) {
        this.fromObj(obj);
    }

};


var JReaXession = function(obj) {
    this.__typeInfo = 'ReaXession';
    this.receiverKey=obj;
    this._actorProxy = true;


    this.$subscribeKey = function(table, recordKey, cb) {
        var call = MinBin.obj('call', {
            method: '$subscribeKey',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                table,
                recordKey,
                MinBin.obj('Callback',cb)
            ])
        });
        return Kontraktor.send(call);
    };
    this.$query = function(table, query, cb) {
        var call = MinBin.obj('call', {
            method: '$query',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                table,
                query,
                cb
            ])
        });
        return Kontraktor.send(call);
    };
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
    this.$getRLMeta = function() {
        var call = MinBin.obj('call', {
            method: '$getRLMeta',
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


var JMetadata = function(obj) {
    this.__typeInfo = 'Metadata';

    this.j_tables = function() { return MinBin.jmap(this.tables); };
    this.j_name = function() { return this.name; };


    this.fromObj = function(obj) {
        for ( var key in obj ) {
            var setter = 'j_'.concat(key);
            if ( this.hasOwnProperty(setter) ) {
                this[key] = obj[key];
            }
        }
        return this;
    };
    if ( obj != null ) {
        this.fromObj(obj);
    }

};


var JUser = function(obj) {
    this.__typeInfo = 'User';

    this.j_version = function() { return MinBin.parseIntOrNan(this.version, 'int' ); };
    this.j_creationTime = function() { return this.creationTime; };
    this.j_email = function() { return this.email; };
    this.j_lastLogin = function() { return this.lastLogin; };
    this.j_name = function() { return this.name; };
    this.j_pwd = function() { return this.pwd; };
    this.j_recordKey = function() { return this.recordKey; };
    this.j_role = function() { return MinBin.obj('UserRole',this.role); };


    this.fromObj = function(obj) {
        for ( var key in obj ) {
            var setter = 'j_'.concat(key);
            if ( this.hasOwnProperty(setter) ) {
                this[key] = obj[key];
            }
        }
        return this;
    };
    if ( obj != null ) {
        this.fromObj(obj);
    }

};



var mbfactory = function(clzname,jsObjOrRefId) {
    switch (clzname) {
        case 'TestRecord': return new JTestRecord(jsObjOrRefId);
        case 'ReaXession': return new JReaXession(jsObjOrRefId);
        case 'ReaXerve': return new JReaXerve(jsObjOrRefId);
        case 'Metadata': return new JMetadata(jsObjOrRefId);
        case 'User': return new JUser(jsObjOrRefId);
        default: if (!jsObjOrRefId) return { __typeInfo: clzname }; else { jsObjOrRefId.__typeInfo = clzname; return jsObjOrRefId; }
    }
};

MinBin.installFactory(mbfactory);
