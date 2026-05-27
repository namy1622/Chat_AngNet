using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Interfaces.Services
{
    // Interface xử lý ảnh (resize, thumbnail, validate)
    // Tách riêng để:
    //   - Có thể swap thư viện (SkiaSharp → ImageSharp) dễ dàng
    public interface IImageProcessor
    {
        // Tạo thumbnail từ ảnh gốc
        // maxWidth/maxHeight: kích thước tối đa (giữ tỉ lệ gốc)
        // quality: chất lượng JPEG (0-100)
        // Trả về: Stream chứa ảnh thumbnail
        Task<Stream> CreateThumbnailAsync(
            Stream source,
            int maxWidth = 300,
            int maxHeight = 300,
            int quality = 75);

        // Kiểm tra file có phải ảnh hợp lệ không
        // Đọc "magic number" (vài byte đầu file) thay vì tin extension
        // Tại sao? User có thể đổi tên virus.exe → photo.jpg
        bool IsValidImage(Stream stream, string declaredContentType);
    }
}
