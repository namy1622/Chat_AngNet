using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Chat.Commands.Groups.CreateGroupConversation
{
    // handler: class chua logic xu ly khi nhan duoc CreateGroupConversationCommand 
    public class CreateGroupConversationCommandHandler : IRequestHandler<CreateGroupConversationCommand, Guid>
    {
        private readonly IChatContext _chatContext;

        public CreateGroupConversationCommandHandler(IChatContext chatContext)
        {
            _chatContext = chatContext;
        }

        public async Task<Guid> Handle(CreateGroupConversationCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrEmpty(request.Name))
                throw new ArgumentException("-- Conversation name cannot be empty --");
            if (request.MemberIds == null || request.MemberIds.Count < 2)
                throw new ArgumentException("-- A group conversation must have at least 2 members --");

            //
            var newConversation = new Domain.Entities.Conversation
            {
                Id = Guid.NewGuid(),
                Type = Domain.Enum.ConversationType.Group,
                Name = request.Name,
                CreatedAt = DateTime.UtcNow
            };

            // - tao participant cho nguoi tao group conversation (role = owner)
            var ownerParticipant = new ConversationParticipant
            {
                Id = Guid.NewGuid(),
                ConversationId = newConversation.Id,
                UserId = request.CurrentUserId,
                Role = Domain.Enum.ParticipantRole.Owner, // nguoi tao luon la owner
                JoinedAt = DateTime.UtcNow
            };

            // - tao participant cho member duoc moi (role = member)
            var memberParticipants = request.MemberIds
                .Distinct()
                .Where(memberId => memberId != request.CurrentUserId) // loai bo owner
                .Select(memberId => new ConversationParticipant
                {
                    Id = Guid.NewGuid(),
                    ConversationId = newConversation.Id,
                    UserId = memberId,
                    Role = Domain.Enum.ParticipantRole.Member,
                    JoinedAt = DateTime.UtcNow,
                }).ToList();

            //
            _chatContext.Conversations.Add(newConversation);
            _chatContext.ConversationParticipants.Add(ownerParticipant);

            //
            foreach(var member in memberParticipants)
            {
                _chatContext.ConversationParticipants.Add(member);
            }

            // saveChangesAsync commit all thay doi vao db trong 1 transaction
            await _chatContext.SaveChangesAsync(cancellationToken);

            return newConversation.Id;
        }
    }
}
