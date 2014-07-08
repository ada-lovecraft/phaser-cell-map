'use strict';




function DOMishParser() {}
DOMishParser.prototype.parseFromString = function (data) {
    return new DOMishObject(JSON.parse(data));
};

DOMishParser.init = function() {
    window.DOMParser = DOMishParser;
}; 

function DOMishAttributes() {}
DOMishAttributes.prototype.getNamedItem = function (name) {
    return {
        nodeValue: this[name] || null
    };
};

function makeDOMishObject(data) {
    return new DOMishObject(data);
}

function DOMishObject(data) {
    this.attributes = this.convertContent(data);
    this.length = Object.keys(this.attributes).length;
}
DOMishObject.prototype.documentElement = document;
DOMishObject.prototype.convertContent = function (obj) {
    var attributes = new DOMishAttributes(),
        prop;

    for (prop in obj) {
        if (obj[prop] !== null && typeof obj[prop] === 'object') {
            attributes[prop] = Array.isArray(obj[prop]) ?
                obj[prop].map(makeDOMishObject) : new DOMishObject(obj[prop]);
        } else {
            attributes[prop] = obj[prop];
        }
    }

    return attributes;
};
DOMishObject.prototype.getElementsByTagName = function(name) {
    if(this.attributes[name]) {
        return Array.isArray(this.attributes[name]) ?
        this.attributes[name] : [this.attributes[name]];
    }
    for(var attr in this.attributes) {
        var attribute = this.attributes[attr];
        if(attribute.attributes && attribute.attributes.hasOwnProperty(name)) {
            return attribute.attributes[name];
        }
    }
    return [];
        
};

DOMishObject.prototype.getAttribute = function(name) {
    return this.attributes[name];
};
