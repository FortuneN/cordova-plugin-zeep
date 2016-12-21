module.exports = {
	zip: function (successCallback, errorCallback, args) {
		FiNeZeep.FiNeZeep.zip(args).then(function () {
			successCallback();
		}, function (error) {
			errorCallback(error);
		});
	},
	unzip: function (successCallback, errorCallback, args) {
		FiNeZeep.FiNeZeep.unzip(args).then(function () {
			successCallback();
		}, function (error) {
			errorCallback(error);
		});
	}
};
require("cordova/exec/proxy").add("Zeep", module.exports);