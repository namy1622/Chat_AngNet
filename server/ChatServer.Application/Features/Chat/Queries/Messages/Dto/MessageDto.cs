namespace ChatServer.Application.Features.Chat.Queries.GetMessages.Dto
{
    // === DTO tom tat 1 nhom reaction (VD: 👍 x 3 nguoi) ===
      public class ReactionSummaryDto
    {
        public int Type { set; get; }       // ReactionType enum (1=Like, 2=Heart,...)
        public string Emoji { set; get; }   // ky tu emoji: "👍", "❤️",...
        public int Count { set; get; }      // so luong nguoi da react loai nay
        public bool UserReacted { set; get; } // true = MINH da react loai nay
    }

    public class MessageDto
    {
        public Guid Id { set; get; }
        public Guid SenderId { set; get; }
        public string SenderName { set; get; }
        public string Content { set; get; }
        public DateTime CreateAt { set; get; }
        public bool IsMine { set; get; } // de FE biet de hien ben trai hay phai

        // chi co y nghia voi Minh - userId (tk dang login)
        // true = it nhat 1 user khac da doc
        // false = chua ai doc
        public bool IsRead { set; get; }

        //-- reply message --
        public Guid? ReplyToId { set; get; }
        public string? ReplyToContent { set; get; } // noi dung tin nhan goc (reply to)
        public string? ReplyToSenderName { set; get; } // name nguoi gui tin nhan goc (reply to)

        //-- reactions --
        public List<ReactionSummaryDto> Reactions { set; get; } = new();

        //-- file attachments --
        public int MessageType { get; set; }  // 0=Text, 1=Image, 2=File, ...
        public List<AttachmentDto> Attachments { get; set; } = new();
    }

    // ===== DTO cho file đính kèm =====
    public class AttachmentDto
    {
        public long FileId { get; set; }
        public string FileName { get; set; } = default!;  // tên gốc
        public string Url { get; set; } = default!;       // "/api/file/{id}"
        public string? ThumbnailUrl { get; set; }          // "/api/file/{id}/thumbnail"
        public string ContentType { get; set; } = default!;
        public long Size { get; set; }
        public string FileType { get; set; } = default!;   // "Image", "Document"
    }
}
