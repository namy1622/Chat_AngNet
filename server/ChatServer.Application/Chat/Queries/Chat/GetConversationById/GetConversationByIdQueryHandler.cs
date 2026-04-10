using ChatServer.Application.Chat.Queries.Chat.GetConversations.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetConversationById
{
    public class GetConversationByIdQueryHandler : IRequestHandler<GetConversationByIdQuery, ConversationDto?>
    {
        private readonly IChatContext _context;

        public GetConversationByIdQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<ConversationDto?> Handle(GetConversationByIdQuery request, CancellationToken cancellationToken)
        {
            var conv = await _context.Conversations
                .Include(c => c.Participants)
                    .ThenInclude(p => p.User) // join them User de lay ten
                .Include(c => c.LastMessage)
                .FirstOrDefaultAsync(c => c.Id == request.ConversationId, cancellationToken);

            if (conv == null) return null;

            // check quyen: user co phai participant ko
            var isMember = conv.Participants?.Any(p => p.UserId == request.CurrentUserId) ?? false;

            if (!isMember) return null; // ko phai thanh vien

            // xac dinh ten + avatar hien thi
            string? displayName;
            string? displayAvatar;
            bool isOnline = false;

            if(conv.Type == Domain.Enum.ConversationType.Group)
            {
                displayAvatar = conv.AvatarUrl;
                displayName = conv.Name ;
            }
            else
            {
                // private chat
                var otherUser = conv.Participants.FirstOrDefault(p => p.UserId != request.CurrentUserId)?.User;

                displayName = otherUser != null ? $"{otherUser.FirstName} {otherUser.LastName}" : "Unknown";
                displayAvatar = otherUser?.AvatarUrl;
                isOnline = otherUser?.IsOnline ?? false;
            }

            // === TÍNH UNREAD COUNT ===
            var unreadCount = await _context.Messages
                .Where(m => m.ConversationId == conv.Id
                            && m.SenderId != request.CurrentUserId)
                .CountAsync(m => !_context.MessageReadStates
                    .Any(rs => rs.MessageId == m.Id
                               && rs.UserId == request.CurrentUserId),
                    cancellationToken);

            return new ConversationDto
            {
                Id = conv.Id,
                Name = displayName ?? "Unknown",
                AvartarUrl = displayAvatar ?? string.Empty,
                LastMessage = conv.LastMessage?.Content ?? "",
                LastMessageTime = conv.LastMessage?.CreatedAt,
                IsOnline = isOnline,
                UnreadCount = unreadCount,
                Type = conv.Type.ToString(),
                MemberCount = conv.Participants?.Count ?? 0
            };
        }
    }
}
