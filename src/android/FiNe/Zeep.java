package FiNe;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import java.io.File;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import java.util.zip.ZipEntry;

public class cordovaPluginZeep extends CordovaPlugin
{
    private static final int BUFFER_SIZE = 2048;
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException
    {
        try
        {
            if (action.equals("zip"))
            {
                zip(args.getString(0), args.getString(1), args.getString(2).equals("yes") ? true : false);
            }
            else
            {
                unzip(args.getString(0), args.getString(1));
            }
            
            callbackContext.success("");
            return true;
        }
        catch (Exception e)
        {
            callbackContext.error(e.getMessage());
            return false;
        }
    }
    
    private void zip(final String from, final String to, final boolean noCompression) throws Exception
    {
        ZipOutputStream outStream = null;
        
        try
        {
            outStream = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(to)));
            if (noCompression) outStream.setMethod(ZipOutputStream.DEFLATED);
            
            walk(outStream, new File(from), new WalkListener()
            {
                @Override
                public void onFile(ZipOutputStream outStream, String path) throws Exception
                {
                    byte[] buffer = new byte[BUFFER_SIZE];
                    BufferedInputStream inStream = null;
                    
                    try
                    {
                        inStream = new BufferedInputStream(new FileInputStream(path), BUFFER_SIZE);
                        outStream.putNextEntry(new ZipEntry(path));
                        int count;
                        
                        while ((count = inStream.read(buffer, 0, BUFFER_SIZE)) != -1)
                        {
                            outStream.write(buffer, 0, count);
                        }
                    }
                    finally
                    {
                        if (inStream != null)
                        {
                            inStream.close();
                        }
                    }
                }
            });
        }
        finally
        {
            if (outStream != null)
            {
                outStream.close();
            }
        }
    }
    
    private void unzip(final String from, final String to) throws Exception
    {
        ZipInputStream inStream = null;
        
        try
        {
            inStream = new ZipInputStream(new BufferedInputStream(new FileInputStream(from)));
            byte[] buffer = new byte[BUFFER_SIZE];
            ZipEntry entry;
            
            while((entry = inStream.getNextEntry()) != null)
            {
                BufferedOutputStream outStream = null;
                
                try
                {
                    outStream = new BufferedOutputStream(new FileOutputStream(to + File.separator + entry.getName()), BUFFER_SIZE);
                    int count;
                    
                    while ((count = inStream.read(buffer, 0, BUFFER_SIZE)) != -1)
                    {
                        outStream.write(buffer, 0, count);
                    }
                }
                finally
                {
                    if (outStream != null)
                    {
                        outStream.close();
                    }
                }
            }
        }
        finally
        {
            if (inStream != null)
            {
                inStream.close();
            }
        }
    }
    
    private static void walk(ZipOutputStream outStream, File parentFile, WalkListener listener) throws Exception
    {
        File[] files = parentFile.listFiles();
        if (files != null)
        {
            for (File file : files)
            {
                if (file.isDirectory())
                {
                    walk(outStream, file, listener);
                }
                else
                {
                    listener.onFile(outStream, file.getAbsolutePath());
                }
            }
        }
    }
    
    interface WalkListener
    {
        void onFile(ZipOutputStream outStream, String path) throws Exception;
    }
}
