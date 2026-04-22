using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Chat.Commands.CreateConversation
{
    public class CreateConversationCommandHandler : IRequestHandler<CreateConversationCommand, Guid>
    {
        private readonly IChatContext _context;

        public CreateConversationCommandHandler(IChatContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateConversationCommand request, CancellationToken cancellationToken)
        {
            // 1. Check da co conversation private(1) 1-1 giua 2 user chua
            var existingConversation = await _context.Conversations
                .Where(c => c.Type == Domain.Enum.ConversationType.Private)
                .Where(c => c.Participants.Any(p => p.UserId == request.CurrentUserId)
                         && c.Participants.Any(p => p.UserId == request.TargetUserId))
                .FirstOrDefaultAsync(cancellationToken);

            if(existingConversation != null)
            {
                return existingConversation.Id;
            }

            // neu chua co -> tao conversation moi
            var newConversation = new Domain.Entities.Conversation
            {
                Id = Guid.NewGuid(),
                Type = Domain.Enum.ConversationType.Private,
                Name = "", // chat 1-1 ko can ten
                //CreateBy = request.CurrentUserId,
                CreatedAt = DateTime.UtcNow,
            };

            // them 2 participants (Minh va Doi phuong)
            var p1 = new ConversationParticipant
            {
                ConversationId = newConversation.Id,
                UserId = request.CurrentUserId,
                Role = Domain.Enum.ParticipantRole.Member
            };

            var p2 = new ConversationParticipant
            {
                ConversationId = newConversation.Id,
                UserId = request.TargetUserId,
                Role = Domain.Enum.ParticipantRole.Member,
            };

            _context.Conversations.Add(newConversation);
            _context.ConversationParticipants.Add(p1);
            _context.ConversationParticipants.Add(p2);

            await _context.SaveChangesAsync(cancellationToken);

            return newConversation.Id;
        }
    }
}
