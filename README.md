# cordova-plugin-zeep
Zip compression/decompression on the [Apache Cordova](https://cordova.apache.org) / [PhoneGap](http://phonegap.com) platform

### Platforms
- ios
- android
- windows

### Add to project
```sh
cordova plugin add cordova-plugin-zeep
```

### Remove from project
```sh
cordova plugin remove cordova-plugin-zeep
```

### Compression (Zeep.zip or $cordovaZeep.zip)
from : [string] the path/url of the folder whose contents you want to compress<br/>
to&nbsp;&nbsp;&nbsp;&nbsp; : [string] the path/url of the zip file that you want to produce

### Decompression (Zeep.unzip or $cordovaZeep.unzip)
from : [string] the path/url of the zip file that you want to decompress<br/>
to&nbsp;&nbsp;&nbsp;&nbsp; : [string] the path/url of the folder in which you want to deposit the contents of the zip file

### Plain JS example
```js
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
```

### [Angular](https://angularjs.org) example
(+ other angular-based frameworks -> Ionic, Mobile Angular UI, LumX, MEAN, Angular Foundation, ...)
```js

var module = angular.controller('MyModule', ['ngCordova.plugins.zeep'])

...

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
```

### License
Apache 2.0
