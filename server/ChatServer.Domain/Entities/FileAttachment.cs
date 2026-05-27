using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Domain.Entities
{
    // Entity lưu thông tin 1 file đã upload
    public class FileAttachment : AuditableEntity<long>
    {
        // Tên file gốc -> Dùng để hiển thị cho user. KHÔNG dùng làm tên file lưu trên disk
        public string OriginalFileName { get; set; } = default!;

        // Tên file thực tế lưu trên disk (VD: "a3b2c1d4.jpg")
        // Dùng GUID -> tránh trùng tên + bảo mật 
        public string StoredFileName { get; set; } = default!;

        // Đường dẫn tương đối trong thư mục Uploads
        public string StoragePath { get; set; } = default!;

        // MIME type gốc của file (VD: "image/jpeg", "application/pdf")
        // Server dùng khi trả file về cho client (Content-Type header)
        public string ContentType { get; set; } = default!;

        // Kích thước file (bytes) — hiển thị "2.5 MB" ở FE
        public long Size { get; set; }

        // Loại file (enum) — quyết định cách FE render
        public FileType FileType { get; set; }

        // Đường dẫn thumbnail (chỉ có với ảnh) // VD: "images/2026/05/a3b2c1d4_thumb.jpg"
        public string? ThumbnailPath { get; set; }

        // Ai upload file này — dùng để kiểm tra quyền
        public Guid UploadedByUserId { get; set; }

        [ForeignKey("UploadedByUserId")]
        public User UploadedBy { get; set; } = default!;

        // Navigation: file này được gắn vào những message nào
        // 1 file - n message 
        public ICollection<MessageAttachment> MessageAttachments { get; set; } = new List<MessageAttachment>();

        // public static implicit operator FileAttachment(FileAttachment v)
        // {
        //     throw new NotImplementedException();
        // }
    }
}
