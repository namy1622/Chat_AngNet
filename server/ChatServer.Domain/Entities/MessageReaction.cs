using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

// entity ghi chep tat ca cac reaction tu user nao len message nao
public class MessageReaction : BaseEntity<Guid>
{
    public Guid MessageId {set; get;} // message id
    public Guid UserId {set; get;} // user id

    public ReactionType Type {set; get;} 
    public DateTime ReactedAt {set; get;} = DateTime.UtcNow;

    [ForeignKey("MessageId")]
    public Message Message {set; get;}

    [ForeignKey("UserId")]
    public User User {set; get;}
}