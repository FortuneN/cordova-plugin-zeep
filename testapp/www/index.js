var consoleLog = console.log;
console.log = function () {
	var args = [];
	for (var i = 0; i < arguments.length; i++) {
		args.push(JSON.stringify ? JSON.stringify(arguments[i]) : arguments[i]);
	}
	var body = document.getElementsByTagName('body')[0];
	body.innerHTML += ('#' + args.join(', ') + '<br>');
	consoleLog.apply(this, args);
};

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

function parallelExec(tasks, tasksComplete) {
	try {
		if (tasks && tasks.length) {
			var completeTasks = 0, done = false;
			for (var i = 0; i < tasks.length; i++) {
				if (done) break;
				var task = tasks[i];
				task(function (error) {
					if (done) return done;
					if (error) {
						done = true;
						tasksComplete(error);
					} else {
						if (tasks.length === (++completeTasks)) {
							done = true;
							tasksComplete();
						}
					}
				});
			}
		} else {
			tasksComplete();
		}
	} catch (error) {
		tasksComplete(error);
	}
}

function writeText(file, text, callback) {
	file.createWriter(function (fileWriter) {
		fileWriter.onwrite = function (e) {
			callback();
		};
		fileWriter.onerror = function (e) {
			callback(e);
		};
		fileWriter.write(new Blob([text], { type: 'text/plain' }));
	}, callback);
}

document.addEventListener('deviceready', function () {
	seriesExec([
		function (callback) {
			console.log('creating variables');
			window.topUrl                = cordova.file.cacheDirectory;
			window.sourceUrl             = topUrl + 'source';
			window.sourceZipUrl          = topUrl + 'source.zip';
			window.sourceZipExtractedUrl = topUrl + 'sourceZipExtracted';
			console.log('topUrl               :', topUrl);
			console.log('sourceUrl            :', sourceUrl);
			console.log('sourceZipUrl         :', sourceZipUrl);
			console.log('sourceZipExtractedUrl:', sourceZipExtractedUrl);
			callback();
		},
		function (callback) {
			window.resolveLocalFileSystemURL(topUrl, function (topDir) {
				seriesExec([
					function (callback) {
						topDir.getDirectory('source', { create: true }, function (sourceDir) {
							seriesExec([
								function (callback) {
									sourceDir.getFile('level1File1.txt', { create: true }, function (file) {
										writeText(file, "level1File1.txt", callback);
									}, callback);
								},
								function (callback) {
									sourceDir.getFile('level1File2.txt', { create: true }, function (file) {
										writeText(file, "level1File2.txt", callback);
									}, callback);
								},
								function (callback) {
									sourceDir.getDirectory('level1Directory1', { create: true }, function (level1Directory1) {
										seriesExec([
											function (callback) {
												level1Directory1.getFile('level2File1.txt', { create: true }, function (file) {
													writeText(file, "level2File1.txt", callback);
												}, callback);
											},
											function (callback) {
												level1Directory1.getFile('level2File2.txt', { create: true }, function (file) {
													writeText(file, "level2File2.txt", callback);
												}, callback);
											},
											function (callback) {
												level1Directory1.getDirectory('level2Directory1', { create: true }, function (level2Directory1) {
													callback();
												}, callback);
											},
											function (callback) {
												level1Directory1.getDirectory('level2Directory2', { create: true }, function (level2Directory2) {
													callback();
												}, callback);
											}
										], callback);
									}, callback);
								},
								function (callback) {
									sourceDir.getDirectory('level1Directory2', { create: true }, function (level1Directory2) {
										seriesExec([
											function (callback) {
												level1Directory2.getFile('level2File1.txt', { create: true }, function (file) {
													writeText(file, "level2File1.txt", callback);
												}, callback);
											},
											function (callback) {
												level1Directory2.getFile('level2File2.txt', { create: true }, function (file) {
													writeText(file, "level2File2.txt", callback);
												}, callback);
											},
											function (callback) {
												level1Directory2.getDirectory('level2Directory1', { create: true }, function (level2Directory1) {
													callback();
												}, callback);
											},
											function (callback) {
												level1Directory2.getDirectory('level2Directory2', { create: true }, function (level2Directory2) {
													callback();
												}, callback);
											}
										], callback);
									}, callback);
								}
							], callback);
						}, callback);
					}
				], callback);
			}, callback);
		},
		function (callback) {
			console.log('zipping ...');
			Zeep.zip({
				from : sourceUrl,
				to   : sourceZipUrl
			},
			function () {
				console.log('zip success');
				callback();
			}, function (error) {
				callback(error ? { 'zipError': error } : null);
			});
		},
		function (callback) {
			console.log('unzipping ...');
			Zeep.unzip({
				from : sourceZipUrl,
				to   : sourceZipExtractedUrl
			},
			function () {
				console.log('unzip success');
				callback();
			}, function (error) {
				callback(error ? { 'unzipError': error } : null);
			});
		},
	], function (error) {
		if (error) {
			console.log('ERROR: ', error);
		} else {
			console.log('SUCCESS');
		}
	});
}, false);