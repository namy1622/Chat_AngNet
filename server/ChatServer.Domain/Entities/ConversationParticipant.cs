using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;


public class ConversationParticipant : FullAuditEntity<Guid>
{
    public Guid ConversationId {set; get;}
    public Guid UserId {set; get;}

    public string? NickName {set; get;}
    public ParticipantRole Role {set; get;} // role của user trong conversation

    public DateTime JoinedAt {set; get;} = DateTime.UtcNow;
    public DateTime? MutedUntil {set; get;}

    [ForeignKey("ConversationId")]
    public Conversation Conversation {set; get;}

    [ForeignKey("UserId")]
    public User User {set; get;}
}