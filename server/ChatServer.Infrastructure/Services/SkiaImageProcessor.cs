using ChatServer.Application.Common.Interfaces.Services;
using SkiaSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Infrastructure.Services
{

    public class SkiaImageProcessor : IImageProcessor
    {
        // ===== BẢNG MAGIC NUMBER =====
        // Mỗi loại file có vài byte đầu tiên cố định (gọi là "file signature" hay "magic number")
        // Dùng để xác nhận file THỰC SỰ là ảnh, không phải virus đổi đuôi
        //
        // JPEG: bắt đầu bằng FF D8 FF
        // PNG:  bắt đầu bằng 89 50 4E 47 (hex của ".PNG")
        // GIF:  bắt đầu bằng 47 49 46 38 (hex của "GIF8")
        // WebP: bắt đầu bằng 52 49 46 38 (hex "RIFF") + byte 8-11 là "WEBP"
        private static readonly (byte[] Signature, string MineType)[] _signatures =
        {
            (new byte[] { 0xFF, 0xD8, 0xFF }, "image/jpeg"),
            (new byte[] { 0x89, 0x50, 0x4E, 0x47 }, "image/png"),
            (new byte[] { 0x47, 0x49, 0x46, 0x38 }, "image/gif"),
        };
        public Task<Stream> CreateThumbnailAsync(Stream source, int maxWidth = 300, int maxHeight = 300, int quality = 75)
        {
            source.Position = 0;

            // Decode ảnh gốc
            using var original = SKBitmap.Decode(source);
            if (original == null)
                throw new InvalidOperationException("Cannot decode image");

            // Tính kích thước thumbnail (giữ tỉ lệ gốc)
            //    VD: ảnh 1200x800, max 300x300
            //    scaleW = 300/1200 = 0.25
            //    scaleH = 300/800  = 0.375
            //    scale  = min(0.25, 0.375) = 0.25
            //    → thumbnail = 300x200
            float scaleW = (float)maxWidth / original.Width;
            float scaleH = (float)maxHeight / original.Height;
            float scale = Math.Min(scaleW, scaleH);

            // Nếu ảnh nhỏ hơn kích thước max → không cần resize
            if (scale >= 1.0f)
            {
                source.Position = 0;
                var copy = new MemoryStream();
                source.CopyTo(copy);
                copy.Position = 0;
                return Task.FromResult<Stream>(copy);
            }

            int newWidth = (int)(original.Width * scale);
            int newHeight = (int)(original.Height * scale);

            // Resize ảnh
            using var resized = original.Resize(new SKImageInfo(newWidth, newHeight), SKFilterQuality.Medium);
            if (resized == null)
                throw new InvalidOperationException("Cannot resize image");

            // Encode ra JPEG với quality chỉ định
            using var image = SKImage.FromBitmap(resized);
            using var data = image.Encode(SKEncodedImageFormat.Jpeg, quality);

            // Trả về Stream
            var result = new MemoryStream();
            data.SaveTo(result);
            result.Position = 0;

            return Task.FromResult<Stream>(result);
        }

        public bool IsValidImage(Stream stream, string declaredContentType)
        {
            // Đọc 12 byte đầu file
            var header = new byte[12];
            stream.Position = 0; // đảm bảo đọc từ đầu
            var bytesRead = stream.Read(header, 0, 12);
            stream.Position = 0; // reset lại để code sau đó đọc file bình thường

            if (bytesRead < 4) return false;

            // Kiểm tra WebP đặc biệt: byte 0-3 = "RIFF", byte 8-11 = "WEBP"
            if (declaredContentType == "image/webp")
            {
                var isRiff = header[0] == 0x52 && header[1] == 0x49
                          && header[2] == 0x46 && header[3] == 0x46;
                var isWebp = bytesRead >= 12
                          && header[8] == 0x57 && header[9] == 0x45
                          && header[10] == 0x42 && header[11] == 0x50;
                return isRiff && isWebp;
            }

            // Kiểm tra JPEG, PNG, GIF
            return _signatures.Any(sig =>
                sig.MineType == declaredContentType &&
                header.Take(sig.Signature.Length).SequenceEqual(sig.Signature));
        }
    }
}
