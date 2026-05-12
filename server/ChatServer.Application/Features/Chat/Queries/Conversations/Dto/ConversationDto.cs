namespace ChatServer.Application.Features.Chat.Queries.GetConversations.Dto
{
    public class ConversationDto
    {
        public Guid Id { set; get; }
        public string Name { set; get; } // name hien thi (group or nguoi chat)
        public string AvartarUrl { set; get; }
        public string LastMessage { set; get; } // tin nhan cuoi cung de hien preview
        public DateTime? LastMessageTime { set; get; } 
        public bool IsOnline { set; get; } // chi cho conversation 1-1, group chat ko can

        public int UnreadCount { set; get; } // so tin nhan chua doc (dung de hien badge thong bao)

        // 
        public string Type { set; get; } // private/group -> de FE hien thi UI tuong ung
        public int MemberCount { set; get; } // so member

    }
}
