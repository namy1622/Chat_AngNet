using System.ComponentModel.DataAnnotations.Schema;
namespace ChatServer.Domain.Entities;

public class MessageReadState 
{
    public Guid MessageId { get; set; }
    public Guid UserId { get; set; }
    public DateTime ReadAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("MessageId")]
    public Message Message { get; set; } = null!;
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
