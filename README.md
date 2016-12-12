# cordova-plugin-zeep
Zip compression/decompression on the cordova/phonegap platform

~~~~
document.addEventListener('deviceready', function() {
    try {
        var source     = cordova.file.applicationDirectory,
            zip        = cordova.file.cacheDirectory + 'zip.zip',
            extraction = cordova.file.cacheDirectory + 'extraction';
        document.body.innerHTML += '<br>#from : ' + source;
        document.body.innerHTML += '<br>#to: ' + zip;
        document.body.innerHTML += '<br>#to: ' + cordova.file.cacheDirectory + 'extractedFolder';
        Zeep.zip({
            from: source,
            to: zip
        }, function() {
            try {
                document.body.innerHTML += '<br>#zip success ! now extracting';
                Zeep.unzip({
                    from: zip,
                    to: extraction
                }, function() {
                    document.body.innerHTML += '<br>#unzip success';
                }, function(e) {
                    document.body.innerHTML += '<br>#unzip error : ' + (e.message || e);
                });
            } catch(e) {
                document.body.innerHTML += '<br>#unziptry error : ' + (e.message || e);
            }
        }, function(e) {
            document.body.innerHTML += '<br>#zip error : ' + (e.message || e);
        });
    } catch(e) {
        document.body.innerHTML += '<br>#ziptry error : ' + (e.message || e);
    }
});
~~~~
