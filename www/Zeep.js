var exec = require('cordova/exec');

function isNullOrWhitespace(text) {
	return !text || !text.replace(/\s/g, '').length;
}

function validateConfig(config, mode, callback) {
	if (typeof (config) !== 'object') {
        return callback('config is required and must be an object');
    }
    if (typeof(config.from) !== 'string' || isNullOrWhitespace(config.from)) {
        return callback('config.from is required and must be a string');
    }
    if (typeof(config.to) !== 'string' || isNullOrWhitespace(config.to)) {
        return callback('config.to is required and must be a string');
    }
    if (mode === 'zip') {
    	window.resolveLocalFileSystemURL(config.from, function (result) {
    		if (!result.isDirectory) {
    			return callback('config.from must be a directory url');
    		}
    		callback();
    	}, function (error) {
    		callback('failed while locating : ' + config.from + " (" + JSON.stringify(error) + ")");
    	});
    }
    if (mode === 'unzip') {
    	window.resolveLocalFileSystemURL(config.from, function (result) {
    		if (!result.isFile) {
    			return callback('config.from must be a file url');
    		}
    		callback();
    	}, function (error) {
    		callback('failed while locating : ' + config.from + " (" + JSON.stringify(error) + ")");
    	});
    }
}

exports.zip = function (config, successCallback, errorCallback) {
	setTimeout(function () {
		try {
			validateConfig(config, 'zip', function (error) {
				if (error) {
					return errorCallback(error);
				}
				exec(successCallback, errorCallback, 'Zeep', 'zip', [config.from, config.to]);
			});
		} catch (error) {
			errorCallback(error.message);
		}
	});
};

exports.unzip = function(config, successCallback, errorCallback) {
	setTimeout(function () {
		try {
			validateConfig(config, 'unzip', function (error) {
				if (error) {
					return errorCallback(error);
				}
				exec(successCallback, errorCallback, 'Zeep', 'unzip', [config.from, config.to]);
			});
		} catch (error) {
			errorCallback(error.message);
		}
	});
};

exports.series = function(tasks, completeCallback) {
	if (typeof (completeCallback) !== 'function') return console.log("series: 'completeCallback' must be a function : " + typeof (completeCallback));
	if (!((Array.prototype.isArray && tasks.isArray(tasks)) || (Object.prototype.toString.call(tasks) === '[object Array]'))) return console.log("series: 'completeCallback' must be a function");
	var task = null;
	if (task = tasks.shift()) {
		if (typeof (task) !== 'function') return console.log("series: all tasks must be functions");
		try {
			task(function (error) {
				if (error) {
					completeCallback(error.message || error.Message || error);
				} else {
					zeepSeries(tasks, completeCallback);
				}
			});
		} catch (error) {
			completeCallback(error.message || error.Message || error);
		}
	} else {
		completeCallback();
	}
}

if (window.angular) {
    window.angular.module('ngCordova.plugins.zeep', []).service('$cordovaZeep', ['$q', function ($q) {
        this.zip = function (config) {
            return $q(function(resolve, reject) {
                window.Zeep.zip(config, resolve, reject);
            });
        };
        this.unzip = function (config) {
            return $q(function(resolve, reject) {
                window.Zeep.unzip(config, resolve, reject);
            });
        };
    }]);
}
