using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Features.Chat.Queries.GetMessages.Dto;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Queries.GetMessages
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
                     IsRead = m.ReadStates.Any(rs => rs.UserId != m.SenderId),

                     // -- reply --
                     ReplyToId = m.ReplyToId,
                     ReplyToContent = m.ReplyTo != null ? m.ReplyTo.Content : null,
                     ReplyToSenderName = m.ReplyTo != null ? m.ReplyTo.Sender.UserName: null
                 })
                 .ToListAsync();
        }
    }
}

/*
=== LY THUYET: Self-referencing FK ===
Message entity co:
  public Guid? ReplyToId { set; get; }     // FK → chinh no (Message)
  public Message? ReplyTo { set; get; }     // Navigation property
Day la quan he "tu tham chieu" (self-referencing):
  - 1 Message co the reply 1 Message khac
  - ReplyTo.ReplyTo.ReplyTo... co the vo han (nhung ta chi lay 1 cap)
Khi query:
  m.ReplyTo?.Content → EF Core tu dong JOIN bang Message voi chinh no
  → SELECT m.*, r.Content as ReplyToContent FROM Messages m 
     LEFT JOIN Messages r ON m.ReplyToId = r.Id
*/