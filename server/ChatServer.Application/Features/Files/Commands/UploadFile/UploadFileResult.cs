using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Files.Commands.UploadFile
{
    public record UploadFileResult(
        long FileId,            // ID trong DB — client dùng để gắn vào message
        //Guid FileId,            // ID trong DB — client dùng để gắn vào message
        string Url,             // URL để xem/download file
        string? ThumbnailUrl,   // URL thumbnail (null nếu không phải ảnh)
        string FileName,        // tên file gốc
        string ContentType,
        long Size,
        string FileType         // "Image", "Document", ...
    );
}
