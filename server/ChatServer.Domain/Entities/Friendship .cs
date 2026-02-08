using System.ComponentModel.DataAnnotations.Schema;
using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

public class Friendship : FullAuditEntity<Guid>{
    public Guid RequesterId {set; get;} // người gửi lời mời
    public Guid AddresseeId {set; get;} // người nhận lời mời

    public FriendshipStatus Status {set; get;} // map voi enum

    [ForeignKey("RequesterId")]
    public User Requester {set; get;}

    [ForeignKey("AddresseeId")]
    public User Addressee {set; get;}
}