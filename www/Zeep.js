var exec = require('cordova/exec');

function isNullOrWhitespace(input) {
    return !input || !input.replace(/\s/g, '').length;
}

function validateConfig(config, callback, zip) {
    if (typeof(config) !== 'object') {
        return callback('config is required and must be an object');
    }
    if (typeof(config.from) !== 'string' || isNullOrWhitespace(config.from)) {
        return callback('config.from is required and must be a string');
    }
    if (typeof(config.to) !== 'string' || isNullOrWhitespace(config.to)) {
        return callback('config.to is required and must be a string');
    }
    callback();
}

exports.zip = function(config, success, error) {
    validateConfig(config, function(e) {
        if (e) return error(e);
        document.body.innerHTML += '<br>exec:before';
        exec(success, error, 'Zeep', 'zip', [config.from, config.to, (config.noCompression ? 'yes' : 'no')]);
        document.body.innerHTML += '<br>exec:after';
    }, true);
};

exports.unzip = function(config, success, error) {
    validateConfig(config, function(e) {
        if (e) return error(e);
        document.body.innerHTML += '<br>exec:before';
        exec(success, error, 'Zeep', 'unzip', [config.from, config.to]);
        document.body.innerHTML += '<br>exec:after';
    }, false);
};

if (window.angular) {
    window.angular.module('ngCordova.plugins.zeep', []).service('$cordovaZeep', ['$q', function ($q) {
        this.zip = function (config) {
            return $(function(resolve, reject) {
                window.Zeep.zip(config, resolve, reject);
            });
        };
        this.unzip: function (config) {
            return $(function(resolve, reject) {
                window.Zeep.unzip(config, resolve, reject);
            });
        };
    }]);
}
