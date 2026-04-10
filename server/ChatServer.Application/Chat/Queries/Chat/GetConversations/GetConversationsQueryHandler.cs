using ChatServer.Application.Chat.Queries.Chat.GetConversations.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetConversations
{
    public class GetConversationsQueryHandler : IRequestHandler<GetUserConversationsQuery, List<ConversationDto>>
    {
        private readonly IChatContext _context;

        public GetConversationsQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<ConversationDto>> Handle(GetUserConversationsQuery request, CancellationToken cancellationToken)
        {
            // query cac conversation cua user co tham gia, sx theo time tin nhan
            // inclue de lay luon thong tin tin nhan cuoi cung va nguoi tham gia
            var conversations = await _context.ConversationParticipants
                .Where(p => p.UserId == request.UserId)
                .Include(p => p.Conversation)
                    .ThenInclude(c => c.LastMessage)
                .Include(p => p.Conversation)
                    .ThenInclude(c => c.Participants) // lay d.s nguoi tham gia de hien thi ten/avartar
                        .ThenInclude(p => p.User)
                .OrderByDescending(p => p.Conversation.LastMessage.CreatedAt) // sx time giam dan (tin nhan moi len dau)
                .Select(p => p.Conversation)
                .ToListAsync(cancellationToken);

            var result = new List<ConversationDto>();

            foreach(var conv in conversations)
            {
                // default lay ten/avatar cua chinh conversation(neu la group)
                string displayName = conv.Name;
                string displayAvatar = conv.AvatarUrl ?? "";
                bool isOnline = false;

                // neu ten rong || chat 1-1(private) -> lay thong tin doi phuong
                if(string.IsNullOrEmpty(conv.Name) || conv.Type == Domain.Enum.ConversationType.Private)
                {
                    // tim nguoi nguoi tham gia ko phai minh
                    var otherParticipant = conv.Participants.FirstOrDefault(p => p.UserId != request.UserId)?.User;
                    if (otherParticipant != null){
                        displayName = string.IsNullOrEmpty(otherParticipant.DisplayName) 
                                        ? otherParticipant.UserName 
                                        : otherParticipant.DisplayName;
                        displayAvatar = otherParticipant.AvatarUrl;
                        isOnline = otherParticipant.IsOnline;
                    }
                }

                // Tinh UnRead Count 
                // Dem so tin nhan (cua nguoi khac) ma chua co MessageReadState cua user hien tai
                // Logic: Tong tin (tru tin minh gui - userId) - tin da doc = tin chua doc
                var unreadCount = await _context.Messages
                    .Where(m => m.ConversationId == conv.Id
                        && m.SenderId != request.UserId) // tru tin nhan cua minh
                    .CountAsync(m => !_context.MessageReadStates
                        .Any(rs => rs.MessageId == m.Id
                            && rs.UserId == request.UserId), // tin chua co readState cua minh
                            cancellationToken);

                result.Add(new ConversationDto
                {
                    Id = conv.Id,
                    Name = displayName ?? "Unknown",
                    AvartarUrl = displayAvatar ?? "",
                    LastMessage = conv.LastMessage != null ? conv.LastMessage.Content : string.Empty,
                    LastMessageTime = conv.LastMessage?.CreatedAt,
                    IsOnline = isOnline,
                    UnreadCount = unreadCount, //

                    Type = conv.Type.ToString(), // conv.Type la enum -> .ToString() chuyen thanh "Private"/"Group"
                    MemberCount = conv.Participants?.Count ?? 0  // conv.Participants la ICollection da inclue o tren -> Count dem thanh vien
                });
                
            }
            return result;
        }
    }
}
