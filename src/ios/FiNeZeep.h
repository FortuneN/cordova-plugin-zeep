#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import <SSZipArchive/SSZipArchive.h>

@interface FiNeZeep : CDVPlugin

-(void)zip:(CDVInvokedUrlCommand*)command;
-(void)unzip:(CDVInvokedUrlCommand*)command;

@end
