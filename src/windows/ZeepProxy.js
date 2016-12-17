var cordovaExec = require('cordova/exec');
var BUFFER_SIZE = 1024;

/*
MOD FileProxy -> cordova-file-plugin -> add method
getNativePathFromURL: function (success, fail, args) {
    var fs = getFilesystemFromURL(args[0]);
    var path = pathFromURL(args[0]);
    if (!fs || !validName(path)) {
    	fail(FileError.ENCODING_ERR);
    	return;
    }
    var fullPath = cordovaPathToNative(fs.winpath + path);
    success(fullPath);
}
*/
function fileExec(method, args, success, fail) {
	cordovaExec(success, fail, 'File', method, args);
}

function seriesExec(tasks, tasksComplete) {
	try {
		var task = null, taskResult = null;
		if (tasks && tasks.length && (task = tasks.shift())) {
			taskResult = task(function (error) {
				if (error) {
					tasksComplete(error);
				} else {
					seriesExec(tasks, tasksComplete);
				}
			}, taskResult);
		} else {
			tasksComplete();
		}
	} catch (error) {
		tasksComplete(error);
	}
}

function relativize(desendantPath, ancestorPath) {
	var result = desendantPath.Replace(ancestorPath, null);
	while (result.StartsWith("/") || result.StartsWith("\\")) {
		result = result.Substring(1);
	}
	return result;
}

function walk(parentFolder, onFileCallback) {
	parentFolder.getFilesAsync().then(function (files) {
		if (files) {
			for (var i = 0; i < files.length; i++) {
				onFileCallback(files[i]);
			}
		}
	});
	parentFolder.getFoldersAsync().then(function (folders) {
		if (folders) {
			for (var i = 0; i < folders.length; i++) {
				walk(folders[i], onFileCallback);
			}
		}
	});
}

function getNameFromPath(path) {
	var result = path, index = -1;
	if ((index = path.lastIndexOf('/')) > -1) {
		result = path.substring(index + 1);
	} else if ((index = path.lastIndexOf('\\')) > -1) {
		result = path.substring(index + 1);
	}
	return result;
}

function getParentPath(path) {
	var result = path, index = -1;
	if ((index = path.lastIndexOf('/')) > -1) {
		result = path.substring(0, index);
	} else if ((index = path.lastIndexOf('\\')) > -1) {
		result = path.substring(0, index);
	}
	return result;
}

function zipAsync(localFolder, zipFile) {

	// Create the zip data in memory
	var zip = new JSZip();

	// Process each input file, adding it to the zip data
	walk()
	var promises = [];
	filePaths.forEach(function (path) {
		promises.push(addFileToZipAsync(path, zip));
	});

	// 'Process' them and then manually apply the template
	return WinJS.Promise.join(promises).then(function () {

		//Generate the compressed zip contents
		var contentBytes = zip.generate({ compression: 'DEFLATE', type: 'uint8array' });

		//Write the zip data to the file in local storage
		return Windows.Storage.FileIO.writeBytesAsync(file, contentBytes).then(function () {
			return file;
		});
	});
}

function addFileToZipAsync(file, zip) {
	return getFileAsUint8Array(file).then(function (fileContents) {
		//Add the file to the zip archive
		zip.file(file.displayName, fileContents);
	});
}

function getFileAsUint8Array(file) {
	return Windows.Storage.FileIO.readBufferAsync(file).then(function (buffer) {

		//Read the file into a byte array
		var fileContents = new Uint8Array(buffer.length);
		var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(buffer);
		dataReader.readBytes(fileContents);
		dataReader.close();

		//Return
		return fileContents;
	});
}

function unzipAsync(filePath) {
	return Windows.Storage.StorageFile.getFileFromPathAsync(filePath).then(getFileAsUint8Array).then(function (zipFileContents) {

        //Create the zip data in memory
        var zip = new JSZip(zipFileContents);

        //Extract files
        var promises = [];
        var lf = Windows.Storage.ApplicationData.current.localFolder;
        zip.files.forEach(function (zippedFile) {

        	//Create new file
        	promises.push(lf.createFileAsync(zippedFile.name, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (localStorageFile) {
				//Copy the zipped file's contents into the local storage file
				var fileContents = zip.file(zippedFile.name).asUint8Array();
				return Windows.Storage.FileIO.writeBytesAsync(localStorageFile, fileContents);
            }));
        });
		
		//Return
        return WinJS.Promise.join(promises);
    });
}

module.exports = {
	zip: function (successCallback, errorCallback, args) {

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
				toFile.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (fileStream) {
					toFileStream = fileStream;
					callback();
				}, errorCallback);
			},
			function (callback) {
				Zip.zipAsync(filePaths, 'testZip.zip').then(function (file) {

				});
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
		/*
		//Zip successful!
					var local = storage.ApplicationData.current.localFolder;
					var archivePath = local.path.concat('/').concat(file.displayName);
					return Zip.unzipAsync(archivePath, true)
							.then(function (file) {
								//Unzip successful!
					});
		 using (var zipStream = await folder.OpenStreamForReadAsync("thezip.zip"))
    {
        using (MemoryStream zipMemoryStream = new MemoryStream((int)zipStream.Length))
        {
            await zipStream.CopyToAsync(zipMemoryStream);

            using (var archive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Read))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    if (entry.Name != "")
                    {
                        using (Stream fileData = entry.Open())
                        {
                            StorageFile outputFile = await folder.CreateFileAsync(entry.Name, CreationCollisionOption.ReplaceExisting);
                            using (Stream outputFileStream = await outputFile.OpenStreamForWriteAsync())
                            {
                                await fileData.CopyToAsync(outputFileStream);
                                await outputFileStream.FlushAsync();
                            }
                        }
                    }
                }
            }
        }
    }*/
	}
};
require("cordova/exec/proxy").add("Zeep", module.exports);