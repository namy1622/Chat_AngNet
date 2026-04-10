using ChatServer.Application.Chat.Queries.Chat.GetMessages.Dto;
using ChatServer.Application.Common.Interfaces.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Queries.Chat.GetMessages
{
    public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, List<MessageDto>>
    {
        private IChatContext _context;

        public GetMessagesQueryHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<List<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
        {
            // check quyen: user co phai participant ko
            var isMember = await _context.ConversationParticipants
                .AnyAsync(p => p.ConversationId == request.ConversationId
                        && p.UserId == request.CurrentUserId,
                        cancellationToken);

            if (!isMember) return new List<MessageDto>(); // rong - ko cho xem tin nhan

            return await _context.Messages
                 .Where(m => m.ConversationId == request.ConversationId)
                 .OrderBy(m => m.CreatedAt) // s.x cu -> moi (hien thi tu tren xuong duoi)
                 .Select(m => new MessageDto
                 {
                     Id = m.Id,
                     SenderId = m.SenderId,
                     SenderName = m.Sender.UserName,
                     Content = m.Content ?? "",
                     CreateAt = m.CreatedAt,
                     // neu SenderId trung voi UserId (current user) dang request -> la tin cua minh
                     IsMine = m.SenderId == request.CurrentUserId,

                     // tin cua minh -> check co ai da doc chua - it nhat 1 nguoi doc
                     IsRead = m.ReadStates.Any(rs => rs.UserId != m.SenderId)
                 })
                 .ToListAsync();
        }
    }
}
