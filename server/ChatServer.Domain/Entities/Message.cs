using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

public class Message : FullAuditEntity<Guid>
{
    public Guid ConversationId {get; set;}
    public Guid SenderId {set; get;}

    public string? Content {get; set;}
    public MessageType Type {set; get;}
    public string? AttachmentUrl {set; get;} // neu la Img/ video/ File

    public Guid? ReplyToId {set; get;} // tra loi tin nhan nao

    [ForeignKey("ReplyToId")]
    public Message? ReplyTo {set; get;}

    [ForeignKey("SenderId")]
    public User Sender {set; get;}

    [ForeignKey("ConversationId")]
    public Conversation Conversation {set; get;}

    public ICollection<MessageReaction> Reactions {set; get;}
    public ICollection<MessageReadState> ReadStates {set; get;}
}