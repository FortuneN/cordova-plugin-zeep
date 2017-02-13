var message = "Zeep: Dummy {0} success in browser";
module.exports = {
	zip: function (successCallback, errorCallback, args) {
		var m = message.replace('{0}', '.zip');
		(console.warn || console.info || console.log)(m);
		successCallback(m);
	},
	unzip: function (successCallback, errorCallback, args) {
		var m = message.replace('{0}', '.unzip');
		(console.warn || console.info || console.log)(m);
		successCallback(m);
	}
};
require("cordova/exec/proxy").add("Zeep", module.exports);
