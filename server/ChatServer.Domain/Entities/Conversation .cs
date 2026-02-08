using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;


public class Conversation : FullAuditEntity<Guid>
{
    public string Name {set; get;}
    public ConversationType Type {set; get;}
    public string? AvatarUrl {set; get;}

    public Guid? LastMessageId {set; get;} // last message id của conversation
    public Message? LastMessage {set; get;} // self-ref nhưng ko cần FK ràng buộc

    public ICollection<ConversationParticipant> Participants {set; get;}
    public ICollection<Message> Messages {set; get;}
}