using ChatServer.Domain.Common;
using ChatServer.Domain.Enum;
namespace ChatServer.Domain.Entities;

public class User : FullAuditEntity<Guid>
{
    public string UserName {set; get;} 
    public string Email {set; get;}
    public string PasswordHash {set; get;}

    public string FirstName { set; get; }
    public string LastName { set; get; }

    public string? DisplayName {set; get;}
    public string? AvatarUrl {set; get;}
    public DateTime? LastActive {set; get;}
    public bool IsOnline {set; get;}
    
    public ICollection<ConversationParticipant> ConversationParticipants {set; get;}
    public ICollection<UserDevice> Devices {set; get;}
    public ICollection<Friendship> ConfiguredFriendships { get; set; }
}