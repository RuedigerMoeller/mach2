
var JReaXession = function(obj) {
    this.__typeInfo = 'ReaXession';
    this.receiverKey=obj;
    this._actorProxy = true;


    this.$getCreationTime = function() {
        var call = MinBin.obj('call', {
            method: '$getCreationTime',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
            ])
        });
        return Kontraktor.send(call,true);
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
    this.$getSubMonitorables = function() {
        var call = MinBin.obj('call', {
            method: '$getSubMonitorables',
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

};


var JInvocation = function(obj) {
    this.__typeInfo = 'Invocation';

    this.j_argument = function() { return MinBin.obj('Object',this.argument); };
    this.j_cbId = function() { return this.cbId; };
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


var JReaXerve = function(obj) {
    this.__typeInfo = 'ReaXerve';
    this.receiverKey=obj;
    this._actorProxy = true;


    this.$authenticate = function(arg0, arg1) {
        var call = MinBin.obj('call', {
            method: '$authenticate',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                arg0,
                arg1
            ])
        });
        return Kontraktor.send(call,true);
    };
    this.$getSession = function(arg0) {
        var call = MinBin.obj('call', {
            method: '$getSession',
            receiverKey: this.receiverKey,
            args: MinBin.jarray([
                arg0
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
    this.$getSubMonitorables = function() {
        var call = MinBin.obj('call', {
            method: '$getSubMonitorables',
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

};


var JInvocationCallback = function(obj) {
    this.__typeInfo = 'InvocationCallback';

    this.j_sequence = function() { return MinBin.parseIntOrNan(this.sequence, 'int' ); };
    this.j_result = function() { return MinBin.obj('Object',this.result); };
    this.j_cbId = function() { return this.cbId; };


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


var JChangeBroadcast = function(obj) {
    this.__typeInfo = 'ChangeBroadcast';

    this.j_originator = function() { return MinBin.parseIntOrNan(this.originator, 'int' ); };
    this.j_type = function() { return MinBin.parseIntOrNan(this.type, 'int' ); };
    this.j_error = function() { return MinBin.obj('Object',this.error); };
    this.j_newRecord = function() { return MinBin.obj('Record',this.newRecord); };
    this.j_appliedChange = function() { return MinBin.obj('RecordChange',this.appliedChange); };
    this.j_recordKey = function() { return this.recordKey; };
    this.j_tableId = function() { return this.tableId; };


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


var JRecordChange = function(obj) {
    this.__typeInfo = 'RecordChange';

    this.j_originator = function() { return MinBin.parseIntOrNan(this.originator, 'int' ); };
    this.j_recordId = function() { return MinBin.obj('Object',this.recordId); };
    this.j_newVal = function() { return MinBin.jarray(this.newVal); };
    this.j_oldVals = function() { return MinBin.jarray(this.oldVals); };
    this.j_tableId = function() { return this.tableId; };
    this.j_fieldIndex = function() { return MinBin.i32(this.fieldIndex); };


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


var JSysTable = function(obj) {
    this.__typeInfo = 'SysTable';

    this.j_freeMB = function() { return MinBin.parseIntOrNan(this.freeMB, 'int' ); };
    this.j_numElems = function() { return MinBin.parseIntOrNan(this.numElems, 'int' ); };
    this.j_sizeMB = function() { return MinBin.parseIntOrNan(this.sizeMB, 'int' ); };
    this.j_version = function() { return MinBin.parseIntOrNan(this.version, 'int' ); };
    this.j_description = function() { return this.description; };
    this.j_recordKey = function() { return this.recordKey; };
    this.j_tableName = function() { return this.tableName; };
    this.j_meta = function() { return MinBin.obj('TableMeta',this.meta); };


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


var JTableMeta = function(obj) {
    this.__typeInfo = 'TableMeta';

    this.j_columns = function() { return MinBin.jmap(this.columns); };
    this.j_customMeta = function() { return this.customMeta; };
    this.j_description = function() { return this.description; };
    this.j_displayName = function() { return this.displayName; };
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


var JColumnMeta = function(obj) {
    this.__typeInfo = 'ColumnMeta';

    this.j_hidden = function() { return this.hidden?1:0; };
    this.j_fieldId = function() { return MinBin.parseIntOrNan(this.fieldId, 'int' ); };
    this.j_order = function() { return MinBin.parseIntOrNan(this.order, 'int' ); };
    this.j_align = function() { return this.align; };
    this.j_bgColor = function() { return this.bgColor; };
    this.j_customMeta = function() { return this.customMeta; };
    this.j_description = function() { return this.description; };
    this.j_displayName = function() { return this.displayName; };
    this.j_displayWidth = function() { return this.displayWidth; };
    this.j_javaType = function() { return this.javaType; };
    this.j_name = function() { return this.name; };
    this.j_renderStyle = function() { return this.renderStyle; };
    this.j_textColor = function() { return this.textColor; };


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


var JQueryTuple = function(obj) {
    this.__typeInfo = 'QueryTuple';

    this.j_querySource = function() { return this.querySource; };
    this.j_tableName = function() { return this.tableName; };


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
        case 'ReaXession': return new JReaXession(jsObjOrRefId);
        case 'Invocation': return new JInvocation(jsObjOrRefId);
        case 'ReaXerve': return new JReaXerve(jsObjOrRefId);
        case 'InvocationCallback': return new JInvocationCallback(jsObjOrRefId);
        case 'ChangeBroadcast': return new JChangeBroadcast(jsObjOrRefId);
        case 'RecordChange': return new JRecordChange(jsObjOrRefId);
        case 'SysTable': return new JSysTable(jsObjOrRefId);
        case 'TableMeta': return new JTableMeta(jsObjOrRefId);
        case 'ColumnMeta': return new JColumnMeta(jsObjOrRefId);
        case 'Metadata': return new JMetadata(jsObjOrRefId);
        case 'QueryTuple': return new JQueryTuple(jsObjOrRefId);
        case 'User': return new JUser(jsObjOrRefId);
        default: if (!jsObjOrRefId) return { __typeInfo: clzname }; else { jsObjOrRefId.__typeInfo = clzname; return jsObjOrRefId; }
    }
};

MinBin.installFactory(mbfactory);
