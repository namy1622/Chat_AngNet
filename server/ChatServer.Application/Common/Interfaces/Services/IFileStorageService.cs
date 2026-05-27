using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Interfaces.Services
{
    // result sau khi lưu file lên storage (local disk, cloud, ...)
    public record FileStorageResult(
        string StoragePath,     // "images/2026/05/abc123.jpg"
        string StoredFileName,  // "abc123.jpg"
        long Size               // bytes
        );
    //
    // Interface abstraction cho việc lưu trữ file
    // Dùng interface vif: 
    //   - Hiện tại: implement bằng LocalDisk (lưu trên ổ cứng server)
    //     nhung sau này chuyển sang Azure Blob / AWS S3 → chỉ cần tạo class mới implement interface này
    //     -> KHÔNG cần sửa business logic (UploadFileCommandHandler)
    //      → Đây là Dependency Inversion Principle (SOLID chữ D)
    public interface IFileStorageService
    {
        // Lưu file vào storage, trả về đường dẫn + metadata
        Task<FileStorageResult> SaveAsync(Stream content, string fileName, string contentType);

        // Đọc file từ storage (trả về Stream để truyền cho client)
        Task<Stream> GetAsync(string storagePath);

        // Xoá file khỏi storage
        Task DeleteAsync(string storagePath);

        // Kiểm tra file có tồn tại không
        bool FileExists(string storagePath);
    }
}
