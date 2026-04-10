namespace ChatServer.Application.Chat.Queries.Chat.GetMessages.Dto
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
    }
}
