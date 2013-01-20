#!/usr/bin/env node

var fs = require('fs');


function help () {
    console.log('Usage: cartocc <path-to-project.mml> <path-to-config.json>');
}

C = function (mml, rules) {
    this.rules = JSON.parse(rules);
    this.mml = JSON.parse(mml);
};

C.prototype.process = function() {
    for (var x in this.mml.Layer) {
        if (typeof this.mml.Layer[x].Datasource !== "undefined") {
            this.customizeLayer(this.mml.Layer[x]);
        }
    }
};

C.prototype.customizeLayer = function(layer) {
    var rule,
        fieldpath,
        matched,
        value,
        flatLayer = this.flatenLayer(layer);
    for (var idx in this.rules) {
        rule = this.rules[idx];
        // must pass every condition
        matched = false;
        for (fieldpath in rule['if']) {
            if (this.layerHasValue(layer, fieldpath, rule['if'][fieldpath])) {
                matched = true;
            }
            else {
                matched = false;
                break;
            }
        }
        if (matched) {
            for (fieldpath in rule.then) {
                value = this.format(rule.then[fieldpath], flatLayer);
                this.setLayerValue(layer, fieldpath, value);
            }
            break;  // Apply only first matching rule
        }
    }
};

/*
* Turns {"Datasource": {"id": "xxx"}} into {"Datasource.id": "xxx"}
*/
C.prototype.flatenLayer = function (layer) {
    var output = {};
    var flaten = function (els, prefix) {
        prefix = prefix && prefix + '.' || "";
        var key;
        for (var el in els) {
            key = prefix + el;
            value = els[el];
            if (value instanceof Object) {
                flaten(value, key);
            }
            else {
                output[key] = value;
            }
        }
    };
    flaten(layer);
    return output;
};

C.prototype.layerHasValue = function (layer, fieldpath, expected) {
    var flatLayer = this.flatenLayer(layer),
        current = flatLayer[fieldpath];
    return expected instanceof Array && expected.indexOf(current) != -1 || current == expected;
};

C.prototype.setLayerValue = function(layer, fieldpath, value) {
    var path_elements = fieldpath.split('.'),
        field = layer;
    for (var el in path_elements) {
        if (typeof field === "undefined") {
            break;
        }
        if (typeof field[path_elements[el]] === "object") {
            field = field[path_elements[el]];
        }
        else {
            field[path_elements[el]] = value;
        }
    }
};

/*
* From Leaflet.
*/
C.prototype.format = function (str, data) {
    return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
        var value = data[key];
        if (!data.hasOwnProperty(key)) {
            throw new Error('No value provided for variable ' + str);
        }
        return value;
    });
};


C.prototype.output = function () {
    return JSON.stringify(this.mml, null, " ");
};

/**
 * Run from command line
 */
function run () {
    var args = process.argv.slice(2);
    if (args.length < 2) {
        help();
        process.exit(1);
    }
    var mml = fs.readFileSync(args[0]);
    var rules = fs.readFileSync(args[1]);
    c = new C(mml, rules);
    c.process();
    process.stdout.write(c.output());
}
if (!module.parent) {
    run();
}
