using ChatServer.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Domain.Entities
{
    // Bang Liên kết Message ←→ FileAttachment
    // n-n: 1 Message có thể gắn nhiều File (gửi 3 ảnh trong 1 tin nhắn)
    //      1 File có thể thuộc nhiều Message (forward tin nhắn có file)
    public class MessageAttachment : BaseEntity<long>
    {
        public Guid MessageId { get; set; }
        public long FileAttachmentId { get; set; }

        // Thứ tự hiển thị file trong message (0, 1, 2, ...)
        // Dùng khi user gửi 3 ảnh → FE cần biết hiện ảnh nào trước
        public int OrderIndex { get; set; }

        // Navigation properties
        [ForeignKey("MessageId")]
        public Message Message { get; set; } = default!;

        [ForeignKey("FileAttachmentId")]
        public FileAttachment FileAttachment { get; set; } = default!;
    }
}
