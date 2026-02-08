using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

public class Notification : FullAuditEntity<Guid>
{
    public Guid UserId {set; get;} // user nhan thong bao
    public NotificationType Type {set; get;}
    public string Title {set; get;}
    public string? TargetUrl {set; get;} // link khi bam vao
    public bool IsRead {set; get;} = false;
    
    [ForeignKey("UserId")]
    public User User {set; get;}
}
