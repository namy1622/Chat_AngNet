using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

// quanr ly thiet bi login cu user (de gui notification,...)
public class UserDevice : AuditableEntity<Guid>
{
    public Guid UserId {set; get;}
    public string DeviceToken {set; get;}
    public string? Platform {set; get;} // web, ios, android

    [ForeignKey("UserId")]
    public User User {set; get;}
}