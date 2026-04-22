namespace ChatServer.Application.Features.Chat.Queries.GetMessages.Dto
{
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
    }
}
