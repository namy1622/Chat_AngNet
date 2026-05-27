using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Domain.Enum
{
    public enum FileType
    {
        Image = 0,      // jpg, png, gif, webp
        Document = 1,   // pdf, docx, txt, xlsx
        Video = 2,      // mp4, webm
        Audio = 3,      // mp3, wav
        Other = 4       // các loại khác
    }
}

// Phân loại file upload —> xác định cách hiển thị ở FE
// Image → hiện ảnh inline, Document → hiện card download, ...