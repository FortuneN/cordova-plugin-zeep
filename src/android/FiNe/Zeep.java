package FiNe;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class Zeep extends CordovaPlugin
{
    private static final int BUFFER_SIZE = 1024;
    
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException
    {
        try
        {
            if (action.equals("zip"))
            {
                zip(args.getString(0), args.getString(1));
            }
            else
            {
                unzip(args.getString(0), args.getString(1));
            }
            
            callbackContext.success();
            return true;
        }
        catch (Exception e)
        {
            callbackContext.error(e.getMessage());
            return false;
        }
    }
    
    private void zip(final String from, final String to) throws Exception
    {
        ZipOutputStream outStream = null;
        
        try
        {
            final File fromFile = getFile(from);
            final File toFile = getFile(to);
            final byte[] buffer = new byte[BUFFER_SIZE];
            
            outStream = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(toFile)));
            
            walk(outStream, fromFile, new WalkListener()
            {
                public void onFile(ZipOutputStream outStream, File file) throws Exception
                {
                    BufferedInputStream inStream = null;
                    
                    try
                    {
                        inStream = new BufferedInputStream(new FileInputStream(file), BUFFER_SIZE);
                        outStream.putNextEntry(new ZipEntry(fromFile.toURI().relativize(file.toURI()).getPath()));
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
            final File fromFile = getFile(from);
            final File toFile = getFile(to);
            final byte[] buffer = new byte[BUFFER_SIZE];
            
            inStream = new ZipInputStream(new BufferedInputStream(new FileInputStream(fromFile)));
            
            ZipEntry entry; while((entry = inStream.getNextEntry()) != null)
            {
                BufferedOutputStream outStream = null;
                
                try
                {
                    File file = new File(toFile, entry.getName());
                    file.getParentFile().mkdirs();
                    outStream = new BufferedOutputStream(new FileOutputStream(file), BUFFER_SIZE);
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
                    listener.onFile(outStream, file);
                }
            }
        }
    }
    
    private static File getFile(String urlOrPath)
    {
        try
        {
            return new File(new URL(urlOrPath).toURI());
        }
        catch (Exception e)
        {
            return new File(urlOrPath);
        }
    }
    
    interface WalkListener
    {
        void onFile(ZipOutputStream outStream, File file) throws Exception;
    }
}
