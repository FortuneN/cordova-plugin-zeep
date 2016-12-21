using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Text;
using System.Threading.Tasks;
using Windows.ApplicationModel;
using Windows.Foundation;
using Windows.Storage;
using Windows.Storage.Streams;

namespace FiNeZeep
{
    public sealed class FiNeZeep
    {
		public static IAsyncOperation<string> zip([ReadOnlyArray] object[] args)
		{
			return zipImpl(args).AsAsyncOperation();
		}

		public static IAsyncOperation<string> unzip([ReadOnlyArray] object[] args)
		{
			return unzipImpl(args).AsAsyncOperation();
		}

		private static async Task<string> zipImpl(object[] args)
		{
			try
			{
				string from = (string)args[0];
				string fromPath = getPath(from);
				StorageFolder fromFolder = await StorageFolder.GetFolderFromPathAsync(fromPath);

				string to = (string)args[1];
				string toPath = getPath(to);
				string toParentPath = getPathParent(toPath);
				StorageFolder toParentFolder = await StorageFolder.GetFolderFromPathAsync(toParentPath);
				StorageFile toFile = await toParentFolder.CreateFileAsync(Path.GetFileName(toPath), CreationCollisionOption.ReplaceExisting);
				
				using (var toStream = await toFile.OpenStreamForWriteAsync())
				using (var toZipArchive = new ZipArchive(toStream, ZipArchiveMode.Create))
				{
					await walk(fromFolder, async delegate (StorageFile file)
					{
						ZipArchiveEntry zipEntry = toZipArchive.CreateEntry(getRelativePath(fromFolder, file), CompressionLevel.Optimal);
						using (Stream ZipFile = zipEntry.Open())
						using (var fileStream = await file.OpenReadAsync())
						{
							byte[] bytes = new byte[fileStream.Size];
							using (var dataReader = new DataReader(fileStream))
							{
								await dataReader.LoadAsync((uint)fileStream.Size);
								dataReader.ReadBytes(bytes);
							}
							ZipFile.Write(bytes, 0, bytes.Length);
						}
					});
				}
				
				return string.Empty;
			}
			catch (Exception e)
			{
				return e.Message;
			}
		}

		private static string getRelativePath(StorageFolder fromFolder, StorageFile file)
		{
			var path = file.Path.Replace(fromFolder.Path, string.Empty);
			while (path.StartsWith("/") || path.StartsWith("\\"))
			{
				path = path.Substring(1);
			}
			return path;
		}

		private static async Task<string> unzipImpl(object[] args)
		{
			try
			{
				string from = (string)args[0];
				string fromPath = getPath(from);
				StorageFile fromFile = await StorageFile.GetFileFromPathAsync(fromPath);

				string to = (string)args[1];
				string toPath = getPath(to);
				string toParentPath = getPathParent(toPath);
				StorageFolder toParentFolder = await StorageFolder.GetFolderFromPathAsync(toParentPath);
				StorageFolder toFolder = await toParentFolder.CreateFolderAsync(Path.GetFileName(toPath), CreationCollisionOption.OpenIfExists);

				using (Stream zipMemoryStream = await fromFile.OpenStreamForReadAsync())
				using (ZipArchive zipArchive = new ZipArchive(zipMemoryStream, ZipArchiveMode.Read))
				{
					foreach (ZipArchiveEntry entry in zipArchive.Entries)
					{
						StorageFolder entryFileFolder = (entry.FullName.Contains("/") || entry.FullName.Contains("\\")) ? await toFolder.CreateFolderAsync(getPathParent(entry.FullName), CreationCollisionOption.OpenIfExists) : toFolder;
						StorageFile file = await entryFileFolder.CreateFileAsync(Path.GetFileName(entry.Name));

						using (Stream fileStream = await file.OpenStreamForWriteAsync())
						using (Stream entryStream = entry.Open())
						{
							byte[] buffer = new byte[entry.Length];
							await entryStream.ReadAsync(buffer, 0, buffer.Length);
							await fileStream.WriteAsync(buffer, 0, buffer.Length);
							await fileStream.FlushAsync();
						}
					}
				}

				return string.Empty;
			}
			catch (Exception e)
			{
				return e.Message;
			}
		}
		
		//UTILS
 
		delegate Task onFile(StorageFile file);

		private static async Task walk(StorageFolder parentFolder, onFile onfile)
		{
			var items = await parentFolder.GetItemsAsync();
			if (items != null)
			{
				foreach (var item in items)
				{
					if (item.IsOfType(StorageItemTypes.Folder))
					{
						await walk((StorageFolder)item, onfile);
					}
					else if (item.IsOfType(StorageItemTypes.File))
					{
						await onfile((StorageFile)item);
					}
				}
			}
		}

		private static string getPathParent(string path)
		{
			return path.Substring(0, path.LastIndexOf("\\"));
		}

		private static Dictionary<string, string> urlToPathMap = null;
		private static string getPath(String urlOrPath)
		{
			if (Path.IsPathRooted(urlOrPath))
			{
				return urlOrPath;
			}
			else
			{
				if (urlToPathMap == null)
				{
					//SOURCE: http://lunarfrog.com/blog/winrt-folders-access
					urlToPathMap = new Dictionary<string, string>();
					urlToPathMap["ms-appdata:///roaming"] = ApplicationData.Current.RoamingFolder.Path;
					urlToPathMap["ms-appdata:///local"]   = ApplicationData.Current.LocalFolder.Path;
					urlToPathMap["ms-appdata:///temp"]    = ApplicationData.Current.TemporaryFolder.Path;
					urlToPathMap["ms-appdata://"]         = getPathParent(ApplicationData.Current.LocalFolder.Path);
				}

				foreach (var pair in urlToPathMap)
				{
					if (urlOrPath.StartsWith(pair.Key))
					{
						return urlOrPath.Replace(pair.Key, pair.Value).Replace("/", "\\");
					}
				}

				return null;
			}
		}
	}
}
