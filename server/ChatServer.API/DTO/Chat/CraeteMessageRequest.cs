namespace ChatServer.API.DTO.Chat
{
    // DTO (Data Transfer Object) de nhan data tu Client khi goi CreateMessage
    public class CreateMessageRequest
    {
        public Guid ConversationId { set; get; }
        public string? Content { set; get; }

        // -- reply message --
        // id tin nhan dang reply
        public Guid? ReplyToId { set; get; }
    }
}
