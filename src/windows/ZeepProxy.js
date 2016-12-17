var BUFFER_SIZE = 1024;
module.exports = {
	zip: function (successCallback, errorCallback, args) {
		//console.log("Zeep", typeof (Zeep));
		successCallback();
		/*
		var fromUrl = args[0],
			fromUri = new Windows.Foundation.Uri(args[0]);
			fromPath = null,
			fromFolder = null,
			toUrl = args[1],
			toUri = new Windows.Foundation.Uri(args[1]),
			toPath = null,
			toFile = null,
			toFileStream = null;

		console.log('fromUrl ', fromUrl);
		console.log('toUrl   ', toUrl);

		seriesExec([
			function (callback) {
				fileExec('getNativePathFromURL', [fromUrl], function (nativePath) {
					fromPath = nativePath;
					callback();
				}, callback);
			},
			function (callback) {
				fileExec('getNativePathFromURL', [toUrl], function (nativePath) {
					toPath = nativePath;
					callback();
				}, callback);
			},
			function (callback) {
				Windows.Storage.StorageFolder.getFolderFromPathAsync(fromPath).then(function (folder) {
					fromFolder = folder;
					callback();
				}, errorCallback);
			},
			function (callback) {
				Windows.Storage.StorageFolder.getFolderFromPathAsync(getParentPath(toPath)).then(function (folder) {
					folder.createFileAsync(getNameFromPath(toPath), Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
						toFile = file;
						callback();
					}, errorCallback);
				}, errorCallback);
			},
			function (callback) {
				zipAsync(fromFolder, toFile).then(function (file) {
					callback();
				}, callback);
			}
		], errorCallback);

		/*console.log('toFileStream: ', toFileStream);
		
		walk(fromFolder, function (file) {
			var fileEntry = zipArchive.CreateEntry(Relativize(file.Path, fromPath), CompressionLevel.Optimal);
			var fileStream = file.OpenStreamForReadAsync();
			var fileWriter = new BinaryWriter(fileEntry.Open());
			{
				int count; while ((count = await fileStream.ReadAsync(buffer, 0, BUFFER_SIZE)) != -1)
				{
					fileWriter.Write(buffer, 0, count);
				}
			}
		});*/
		//var buffer = new Uint8Array(BUFFER_SIZE);
		/*Windows.Storage.StorageFile.getFileFromPathAsync(toPath).then(function (toFile) {
						
					}, errorCallback);*/

	},
	unzip: function (successCallback, errorCallback, args) {
		successCallback();
	}
};
require("cordova/exec/proxy").add("Zeep", module.exports);