using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Common.Interfaces.Services;
using ChatServer.Domain.Entities;
using ChatServer.Domain.Enum;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Files.Commands.UploadFile
{
    public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, UploadFileResult>
    {
        private readonly IChatContext _context;
        private readonly IFileStorageService _fileStorage;
        private readonly IImageProcessor _imageProcessor;

        // -- config max file size ---
        private const long MaxFileSize = 25 * 1024 * 1024; // 25 MB

        // Whitelist các extension được phép upload
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            // Ảnh
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            // Tài liệu
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
            // Video
            ".mp4", ".webm", ".mov",
            // Audio
            ".mp3", ".wav", ".ogg",
            // Nén
            ".zip", ".rar", ".7z"
        };

        // Map từ MIME type prefix → FileType enum
        private static FileType DetermineFileType(string contentType)
        {
            if (contentType.StartsWith("image/")) return FileType.Image;
            if (contentType.StartsWith("video/")) return FileType.Video;
            if (contentType.StartsWith("audio/")) return FileType.Audio;
            // PDF, Word, Excel, ... đều là Document
            return FileType.Document;
        }

        public UploadFileCommandHandler(IChatContext context, IFileStorageService fileStorage, IImageProcessor imageProcessor)
        {
            _context = context;
            _fileStorage = fileStorage;
            _imageProcessor = imageProcessor;
        }

        public async Task<UploadFileResult> Handle(UploadFileCommand request, CancellationToken cancellationToken)
        {
            // ===== 1. VALIDATE =====

            // check size 
            if (request.Size > MaxFileSize)
                throw new InvalidOperationException($"File too large. Maximum size is {MaxFileSize / 1024 / 1024}MB.");

            if (request.Size == 0)
                throw new InvalidOperationException("File is empty.");

            // check extension
            var ext = Path.GetExtension(request.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
                throw new InvalidOperationException($"File type '{ext}' is not allowed.");

            // Sanitize filename — chống path traversal
            var safeFileName = SanitizeFileName(request.FileName);

            // Nếu là ảnh → validate magic number
            var fileType = DetermineFileType(request.ContentType);
            if (fileType == FileType.Image)
            {
                if (!_imageProcessor.IsValidImage(request.FileStream, request.ContentType))
                    throw new InvalidOperationException("Invalid image file. File content does not match declared type.");
                request.FileStream.Position = 0; // reset sau khi validate
            }

            // ===== 2. LƯU FILE =====
            var storageResult = await _fileStorage.SaveAsync(
                request.FileStream,
                safeFileName,
                request.ContentType);

            // ===== 3. TẠO THUMBNAIL (nếu là ảnh) =====
            string? thumbnailPath = null;
            if (fileType == FileType.Image)
            {
                try
                {
                    request.FileStream.Position = 0;
                    using var thumbnailStream = await _imageProcessor.CreateThumbnailAsync(request.FileStream);

                    // Lưu thumbnail với tên: {guid}_thumb.jpg
                    var thumbFileName = Path.GetFileNameWithoutExtension(storageResult.StoredFileName) + "_thumb.jpg";
                    var thumbResult = await _fileStorage.SaveAsync(
                        thumbnailStream,
                        thumbFileName,
                        "image/jpeg");

                    thumbnailPath = thumbResult.StoragePath;
                }
                catch (Exception)
                {
                    // Thumbnail lỗi → không sao, vẫn dùng file gốc
                    // Log warning ở đây nếu có logger
                }
            }

            //long newId = GetLastFileAttachmentId() != 0 ? GetLastFileAttachmentId() + 1 : 1;
            // ===== 4. LƯU VÀO DATABASE =====
            var entity = new FileAttachment
            {
                //Id = newId,
                //Id = Guid.NewGuid(),
                OriginalFileName = safeFileName,
                StoredFileName = storageResult.StoredFileName,
                StoragePath = storageResult.StoragePath,
                ContentType = request.ContentType,
                Size = storageResult.Size,
                FileType = fileType,
                ThumbnailPath = thumbnailPath,
                UploadedByUserId = request.UploadedByUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.FileAttachments.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            // ===== 5. TRẢ VỀ KẾT QUẢ =====
            return new UploadFileResult(
                FileId: entity.Id,
                Url: $"/api/file/{entity.Id}",
                ThumbnailUrl: thumbnailPath != null ? $"/api/file/{entity.Id}/thumbnail" : null,
                FileName: entity.OriginalFileName,
                ContentType: entity.ContentType,
                Size: entity.Size,
                FileType: entity.FileType.ToString()
            );

        }

        //
        private static string SanitizeFileName(string fileName)
        {
            // lay phan ten file bo (bo path nhuw traversal ../../)
            var name = Path.GetFileName(fileName);
             
            // thay the ky tu khong hop le = '_'
            var invalidChars = Path.GetInvalidFileNameChars();
            foreach(var c in invalidChars)
            {
                name = name.Replace(c, '_');
            }

            // gioi hanj do dai ten (200 ky tu)
            if (name.Length > 200) name = name[..200];

            return name;
  
        }

        private long GetLastFileAttachmentId()
        {
            var lastId = _context.FileAttachments.Max(f => (long?)f.Id) ?? 0;
            return lastId;
        }
        
    }
}
