#import <Cordova/CDV.h>
#import "CDVFile.h"
#import "FiNeZeep.h"

@implementation FiNeZeep

-(NSString*)pathForURL:(NSString*)urlString
{
    // Attempt to use the File plugin to resolve the destination argument to a file path.
    
    NSString *path = nil;
    id filePlugin = [self.commandDelegate getCommandInstance:@"File"];
    if (filePlugin != nil)
    {
        CDVFilesystemURL* url = [CDVFilesystemURL fileSystemURLWithString:urlString];
        path = [filePlugin filesystemPathForURL:url];
    }
    
    // If that didn't work for any reason, assume file: URL.
    
    if (path == nil)
    {
        if ([urlString hasPrefix:@"file:"])
        {
            path = [[NSURL URLWithString:urlString] path];
        }
    }
    
    //return
    
    return path;
}

-(void)zip:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
        
    @try
    {
        NSString* fromPath = [self pathForURL:[command.arguments objectAtIndex:0]];
        NSString* toPath   = [self pathForURL:[command.arguments objectAtIndex:1]];
            
        if([SSZipArchive createZipFileAtPath:toPath withContentsOfDirectory:fromPath keepParentDirectory:NO withPassword:nil])
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"failed to zip"];
        }
    }
    @catch(NSException* exception)
    {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[exception reason]];
    }
    @finally
    {
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

-(void)unzip:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
        
    @try
    {
        NSString* fromPath = [self pathForURL:[command.arguments objectAtIndex:0]];
        NSString* toPath   = [self pathForURL:[command.arguments objectAtIndex:1]];
        NSError*  error;
            
        if([SSZipArchive unzipFileAtPath:fromPath toDestination:toPath overwrite:YES password:nil error:&error delegate:self])
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[error localizedDescription]];
        }
    }
    @catch(NSException* exception)
    {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[exception reason]];
    }
    @finally
    {
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
}

@end
