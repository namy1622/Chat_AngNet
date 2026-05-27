using ChatServer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Interfaces.Persistence
{
    // dùng dbContext ở tầng Application mà ko phụ thuộc trực tiếp EF Core -> tạo interface IChatContext
    public interface IChatContext
    {
         DbSet<User> Users { get; set; }
         DbSet<Conversation> Conversations { get; set; }
         DbSet<ConversationParticipant> ConversationParticipants { get; set; }
         DbSet<Message> Messages { get; set; }
         DbSet<MessageReaction> MessageReactions { get; set; }
         DbSet<MessageReadState> MessageReadStates { get; set; }
         DbSet<Friendship> Friendships { get; set; }
         DbSet<UserDevice> UserDevices { get; set; }
         DbSet<Notification> Notifications { get; set; }
         DbSet<CallSession> CallSessions { get; set; }
        DbSet<FileAttachment> FileAttachments { get; set; }
        DbSet<MessageAttachment> MessageAttachments { get; set; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
    // Infrastructure sẽ implement interface này
    // Application sẽ dùng interface này
    // API sẽ dùng interface này
    // -> Tách biệt tầng Application khỏi tầng Infrastructure
}
