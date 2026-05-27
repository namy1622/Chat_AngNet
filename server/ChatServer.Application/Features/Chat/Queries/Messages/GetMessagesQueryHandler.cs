using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Features.Chat.Queries.GetMessages.Dto;
using ChatServer.Domain.Enum;
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

            var messages = await _context.Messages
            .Where(m => m.ConversationId == request.ConversationId)
            .Include(m => m.Sender)
            .Include(m => m.Reactions)
            .Include(m => m.ReadStates)
            .Include(m => m.ReplyTo)
                .ThenInclude(r => r.Sender)
            .Include(m => m.Attachments)
                .ThenInclude(a => a.FileAttachment)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderName = m.Sender.UserName,
                Content = m.Content ?? "",
                CreateAt = m.CreatedAt,
                IsMine = m.SenderId == request.CurrentUserId,
                IsRead = m.ReadStates.Any(rs => rs.UserId != m.SenderId),

                ReplyToId = m.ReplyToId,
                ReplyToContent = m.ReplyTo != null ? m.ReplyTo.Content : null,
                ReplyToSenderName = m.ReplyTo != null ? m.ReplyTo.Sender.UserName : null,

                // --- map reactions ---
                Reactions = m.Reactions
                    .GroupBy(r => r.Type)
                    .Select(g => new ReactionSummaryDto
                    {
                        Type = (int)g.Key,
                        Emoji = g.Key switch
                        {
                            ReactionType.Like => "👍",
                            ReactionType.Heart => "❤️",
                            ReactionType.Laugh => "😂",
                            ReactionType.Wow => "😮",
                            ReactionType.Sad => "😢",
                            ReactionType.Angry => "😡",
                            _ => "👍"
                        },
                        Count = g.Count(),
                        UserReacted = g.Any(x => x.UserId == request.CurrentUserId)
                    })
                    .ToList(),

                // --- map attachments ---
                MessageType = (int)m.Type,
                Attachments = m.Attachments
                    .OrderBy(a => a.OrderIndex)
                    .Select(a => new AttachmentDto
                    {
                        FileId = a.FileAttachment.Id,
                        FileName = a.FileAttachment.OriginalFileName,
                        Url = $"/api/file/{a.FileAttachment.Id}",
                        ThumbnailUrl = a.FileAttachment.ThumbnailPath != null
                            ? $"/api/file/{a.FileAttachment.Id}/thumbnail"
                            : null,
                        ContentType = a.FileAttachment.ContentType,
                        Size = a.FileAttachment.Size,
                        FileType = a.FileAttachment.FileType.ToString()
                    })
                    .ToList()

            }).ToList();

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