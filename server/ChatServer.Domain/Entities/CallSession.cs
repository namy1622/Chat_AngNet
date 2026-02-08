using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

public class CallSession : FullAuditEntity<Guid>
{
    public Guid CallerId {set; get;} // user goi
    public Guid? ReceiverId {set; get;} // user nhan , null neu la goi nhom
    public Guid? ConversationId {set; get;} // call tu nhom nao

    public CallType Type {set; get;}
    public CallStatus Status {set; get;}

    public DateTime? StartedAt {set; get;}
    public DateTime? EndedAt {set; get;}
    public double? DurationSeconds {set; get;} // thoi gian goi

    [ForeignKey("CallerId")]
    public User Caller {set; get;}
    
    [ForeignKey("ReceiverId")]
    public User Receiver {set; get;}
    
    [ForeignKey("ConversationId")]
    public Conversation Conversation {set; get;}
}