# cordova-plugin-zeep
Zip compression/decompression on the cordova/phonegap platform

### Add to project

cordova plugin add https://github.com/FortuneN/cordova-plugin-zeep.git

### Remove from project

cordova plugin remove cordova-plugin-zeep

### Plain example
~~~~
var source    = cordova.file.applicationDirectory,
    zip       = cordova.file.cacheDirectory + 'source.zip',
    extracted = cordova.file.cacheDirectory + 'extracted';

console.log('source    : ' + source   );
console.log('zip       : ' + zip      );
console.log('extracted : ' + extracted);

console.log('zipping ...');

Zeep.zip({
    from : source,
    to   : zip
}, function() {

    console.log('zip success!');
    console.log('unzipping ...');

    Zeep.unzip({
        from : zip,
        to   : extracted
    }, function() {
        console.log('unzip success!');
    }, function(e) {
        console.log('unzip error: ', e);
    });

}, function(e) {
    console.log('zip error: ', e);
});
~~~~

### Angular example
~~~~
module.controller('MyCtrl', function($scope, $cordovaZeep) {
    
    var source    = cordova.file.applicationDirectory,
        zip       = cordova.file.cacheDirectory + 'source.zip',
        extracted = cordova.file.cacheDirectory + 'extracted';
    
    console.log('source    : ' + source   );
    console.log('zip       : ' + zip      );
    console.log('extracted : ' + extracted);
    
    console.log('zipping ...');
    
    $cordovaZeep.zip({
        from : source,
        to   : zip
    }).then(function() {
        
        console.log('zip success!');
        console.log('unzipping ...');
        
        $cordovaZeep.unzip({
            from : zip,
            to   : extracted
        }).then(function() {
            console.log('unzip success!');
        }, function(e) {
            console.log('unzip error: ', e);
        });
        
    }, function(e) {
        console.log('zip error: ', e);
    });
    
});
~~~~
