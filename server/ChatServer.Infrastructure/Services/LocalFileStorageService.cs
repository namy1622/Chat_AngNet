using ChatServer.Application.Common.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _basePath;

        public LocalFileStorageService(IConfiguration config)
        {
            // đọc đường dẫn từ appsettings ?? neu ko config -> default: {project}/Uploads
            _basePath = config["FileStorage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        }

        public Task DeleteAsync(string storagePath)
        {
            var fullPath = Path.Combine(_basePath, storagePath);
            if (File.Exists(fullPath))
                File.Delete(fullPath);
            return Task.CompletedTask;
        }

        public bool FileExists(string storagePath)
        {
            return File.Exists(Path.Combine(_basePath, storagePath));
        }

        public Task<Stream> GetAsync(string storagePath)
        {
            var fullPath = Path.Combine(_basePath, storagePath);
            if (!File.Exists(fullPath))
                throw new FileNotFoundException($"File not found: {storagePath}");

            // FileShare.Read cho phép nhiều request đọc cùng lúc
            Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return Task.FromResult(stream);
        }

        public async Task<FileStorageResult> SaveAsync(Stream content, string fileName, string contentType)
        {
            // tao ten file moi bang GUID 
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            var storedFileName = $"{Guid.NewGuid()}{ext}";

            // Xác định thư mục con theo loại file + ngày tháng
            //    VD: contentType = "image/jpeg" → subDir = "images/2026/05"
            var subDir = GetSubDirectory(contentType);
            var fullDir = Path.Combine(_basePath, subDir);

            // Tạo thư mục nếu chưa có
            Directory.CreateDirectory(fullDir);

            // Ghi file xuống disk
            var fullPath = Path.Combine(fullDir, storedFileName);
            using (var fileStream = new FileStream(fullPath, FileMode.Create))
            {
                await content.CopyToAsync(fileStream);
            }

            // Tính kích thước file
            var fileInfo = new FileInfo(fullPath);

            // Trả về đường dẫn tương đối (dùng "/" cho cross-platform)
            //    QUAN TRỌNG: Replace "\\" thành "/" vì Path.Combine trên Windows tạo ra "\"
            var storagePath = Path.Combine(subDir, storedFileName).Replace('\\', '/');

            return new FileStorageResult(storagePath, storedFileName, fileInfo.Length);
        }

        // === method helpers ===
        private string GetSubDirectory(string contentType)
        {
            var date = DateTime.UtcNow.ToString("yyyy/MM");

            if (contentType.StartsWith("image/")) return $"images/{date}";
            if (contentType.StartsWith("video/")) return $"videos/{date}";
            if (contentType.StartsWith("audio/")) return $"audios/{date}";
            return $"documents/{date}";
        }
    }
}
