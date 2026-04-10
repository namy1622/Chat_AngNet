using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Conversation.MarkMessagesAsRead
{
    public class MarkMessagesAsReadCommandHandler : IRequestHandler<MarkMessagesAsReadCommand, int>
    {
        private readonly IChatContext _context;

        public MarkMessagesAsReadCommandHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(MarkMessagesAsReadCommand request, CancellationToken cancellationToken)
        {
            // - lay all messageId trong conversation
            // chi lay cua nguoi khac (bo qua tin cua minh
            var messageIds = await _context.Messages
                .Where(m => m.ConversationId == request.ConversationId
                      && m.SenderId != request.UserId) // bo qua tin cua minh
                .Select(m => m.Id)
                .ToListAsync(cancellationToken);

            // lay danh sach messageId da doc (ReadState = true)
            var alreadyReadMessageIds = await _context.MessageReadStates
                .Where(rs => rs.UserId == request.UserId
                    && messageIds.Contains(rs.MessageId))
                .Select(rs => rs.MessageId)
                .ToListAsync(cancellationToken);

            //Loc message chua doc
            var unreadMessageIds = messageIds.Where(id => !alreadyReadMessageIds.Contains(id)).ToList();

            if (unreadMessageIds.Count == 0) return 0;

            // tao messageReadState cho tung message chua doc
            var readStates = unreadMessageIds.Select(messageIds => new MessageReadState
            {
                MessageId = messageIds,
                UserId = request.UserId,
                ReadAt = DateTime.UtcNow
            }).ToList();

            // them vao Db va luu
            _context.MessageReadStates.AddRange(readStates);
            await _context.SaveChangesAsync(cancellationToken);

            // tra ve so message vua danh dau da doc
            return unreadMessageIds.Count;
        }
    }
}
