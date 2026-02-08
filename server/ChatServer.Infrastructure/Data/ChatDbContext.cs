using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatServer.Infrastructure.Data;

public class ChatDbContext : DbContext, IChatContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<ConversationParticipant> ConversationParticipants { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<MessageReaction> MessageReactions { get; set; }
    public DbSet<MessageReadState> MessageReadStates { get; set; }
    public DbSet<Friendship> Friendships { get; set; }
    public DbSet<UserDevice> UserDevices { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<CallSession> CallSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Config Key cho bảng trung gian Participant
        modelBuilder.Entity<ConversationParticipant>()
            .HasKey(x => new { x.ConversationId, x.UserId });

        // 2. Config mối quan hệ Friendship (2 chiều User)
        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany(u => u.ConfiguredFriendships)
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Friendship>()
            .HasOne(f => f.Addressee)
            .WithMany()
            .HasForeignKey(f => f.AddresseeId)
            .OnDelete(DeleteBehavior.Restrict);

        // 3. Config Message (Sender)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany()
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // 4. Config CallSession (Caller & Receiver)
        modelBuilder.Entity<CallSession>()
            .HasOne(c => c.Caller)
            .WithMany()
            .HasForeignKey(c => c.CallerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CallSession>()
            .HasOne(c => c.Receiver)
            .WithMany()
            .HasForeignKey(c => c.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // 6. Config LastMessage for Conversation (Nullable FK)
        modelBuilder.Entity<Conversation>()
            .HasOne(c => c.LastMessage)
            .WithMany()
            .HasForeignKey(c => c.LastMessageId)
            .OnDelete(DeleteBehavior.Restrict);

        // 7. Config Key for MessageReadState
        modelBuilder.Entity<MessageReadState>()
            .HasKey(x => new { x.MessageId, x.UserId });
    }
}
